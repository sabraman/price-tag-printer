#!/usr/bin/env node

const defaultUrl = "https://print.sabraman.art";
const target = process.argv[2] ?? defaultUrl;
const canonicalOrigin = defaultUrl;
const timeoutMs = 15_000;

const failures = [];
const checks = [];

function check(label, condition, details = "") {
	checks.push({ label, condition, details });
	if (!condition) failures.push(`${label}${details ? ` — ${details}` : ""}`);
}

function attribute(tag, name) {
	const match = tag.match(new RegExp(`${name}=["']([^"']*)["']`, "i"));
	return match?.[1] ?? null;
}

function findMeta(html, attributeName, value) {
	const tags = html.match(/<meta\b[^>]*>/gi) ?? [];
	return tags.find(
		(tag) => attribute(tag, attributeName)?.toLowerCase() === value,
	);
}

function findLink(html, relation) {
	const tags = html.match(/<link\b[^>]*>/gi) ?? [];
	return tags.find((tag) =>
		(attribute(tag, "rel") ?? "")
			.split(/\s+/)
			.some((item) => item.toLowerCase() === relation),
	);
}

async function fetchText(url) {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), timeoutMs);

	try {
		const response = await fetch(url, {
			headers: {
				"user-agent": "price-tag-generator-discoverability-check/1.0",
			},
			signal: controller.signal,
		});
		return {
			url,
			status: response.status,
			contentType: response.headers.get("content-type") ?? "",
			body: await response.text(),
		};
	} catch (error) {
		return {
			url,
			status: 0,
			contentType: "",
			body: "",
			error: error instanceof Error ? error.message : String(error),
		};
	} finally {
		clearTimeout(timeout);
	}
}

function parseJson(label, body) {
	try {
		return JSON.parse(body);
	} catch (error) {
		check(label, false, error instanceof Error ? error.message : String(error));
		return null;
	}
}

const base = new URL(target).origin;
const pages = await Promise.all(
	[
		"/",
		"/robots.txt",
		"/sitemap.xml",
		"/llms.txt",
		"/openapi.json",
		"/api/openapi",
		"/api/llms",
	].map((path) => fetchText(new URL(path, base).toString())),
);

const byPath = new Map(pages.map((page) => [new URL(page.url).pathname, page]));
const root = byPath.get("/");
const robots = byPath.get("/robots.txt");
const sitemap = byPath.get("/sitemap.xml");
const llms = byPath.get("/llms.txt");
const openapi = byPath.get("/openapi.json");
const openapiRoute = byPath.get("/api/openapi");
const llmsRoute = byPath.get("/api/llms");

for (const page of pages) {
	check(
		`${new URL(page.url).pathname} responds with 2xx`,
		page.status >= 200 && page.status < 300,
		page.error ?? `HTTP ${page.status}`,
	);
}

check(
	"root returns HTML",
	root?.contentType.includes("text/html"),
	root?.contentType ?? "missing response",
);
check(
	"root declares Russian language",
	/<html\b[^>]*\blang=["']ru["']/i.test(root?.body ?? ""),
);
check("root has a title", /<title>[^<]+<\/title>/i.test(root?.body ?? ""));
check(
	"root has a meta description",
	Boolean(findMeta(root?.body ?? "", "name", "description")),
);
check("root has an H1", /<h1\b[^>]*>[^<]+<\/h1>/i.test(root?.body ?? ""));
check(
	"root has a canonical link",
	Boolean(findLink(root?.body ?? "", "canonical")),
);
check(
	"root has an Open Graph title",
	Boolean(findMeta(root?.body ?? "", "property", "og:title")),
);
check("root has JSON-LD", (root?.body ?? "").includes("application/ld+json"));

check(
	"robots advertises the canonical sitemap",
	robots?.body.includes(`${canonicalOrigin}/sitemap.xml`),
);
check(
	"sitemap includes the canonical home page",
	sitemap?.body.includes(`${canonicalOrigin}/`),
);
check(
	"sitemap includes API documentation",
	sitemap?.body.includes(`${canonicalOrigin}/api-docs`),
);

check("llms starts with an H1", /^# [^\n]+/m.test(llms?.body ?? ""));
check("llms includes a summary blockquote", /^> .+/m.test(llms?.body ?? ""));
check("llms links to the live app", llms?.body.includes(`${canonicalOrigin}/`));
check(
	"llms links to the OpenAPI document",
	llms?.body.includes(`${canonicalOrigin}/openapi.json`),
);
check(
	"API llms route matches the public context",
	llmsRoute?.body.includes("# Price Tag Generator"),
);

const openapiSpec = parseJson("OpenAPI JSON is valid", openapi?.body ?? "");
const openapiRouteSpec = parseJson(
	"OpenAPI route JSON is valid",
	openapiRoute?.body ?? "",
);
check(
	"OpenAPI JSON advertises the canonical API",
	openapiSpec?.servers?.[0]?.url === `${canonicalOrigin}/api`,
);
check(
	"OpenAPI route advertises the canonical API",
	openapiRouteSpec?.servers?.[0]?.url === `${canonicalOrigin}/api`,
);
check(
	"OpenAPI has API paths",
	Object.keys(openapiSpec?.paths ?? {}).length > 0,
);

const publicText = pages.map((page) => page.body).join("\n");
for (const placeholder of [
	"your-domain.com",
	"yourusername",
	"price-tag-printer.vercel.app",
	"price-tag-generator.vercel.app",
	"docs.price-tag-generator.com",
]) {
	check(
		`public content has no ${placeholder}`,
		!publicText.includes(placeholder),
	);
}

for (const result of checks) {
	console.log(
		`${result.condition ? "PASS" : "FAIL"} ${result.label}${result.details ? ` (${result.details})` : ""}`,
	);
}

if (failures.length > 0) {
	console.error(
		`\n${failures.length} discoverability check(s) failed for ${base}.`,
	);
	process.exitCode = 1;
} else {
	console.log(
		`\nAll ${checks.length} discoverability checks passed for ${base}.`,
	);
}
