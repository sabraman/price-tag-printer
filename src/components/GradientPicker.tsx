'use client'

import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { useMemo } from 'react'
import type { Theme, ThemeSet } from '@/store/priceTagsStore'

interface GradientPickerProps {
    themes: ThemeSet;
    onChange: (themes: ThemeSet) => void;
    className?: string;
}

const darkThemePresets: ThemeSet[] = [
    // Classic Dark
    {
        default: { start: '#222222', end: '#dd4c9b', textColor: '#ffffff' },
        new: { start: '#222222', end: '#2dc54f', textColor: '#ffffff' },
        sale: { start: '#222222', end: '#CF2E43', textColor: '#ffffff' },
    },
    // Dark Monochrome
    {
        default: { start: '#000000', end: '#666666', textColor: '#ffffff' },
        new: { start: '#000000', end: '#808080', textColor: '#ffffff' },
        sale: { start: '#000000', end: '#999999', textColor: '#ffffff' },
    },
    // Dark Slate
    {
        default: { start: '#2f4550', end: '#b2d1d1', textColor: '#ffffff' },
        new: { start: '#2f4550', end: '#b8dbd9', textColor: '#ffffff' },
        sale: { start: '#2f4550', end: '#e2e2e6', textColor: '#ffffff' },
    },
];

const lightThemePresets: ThemeSet[] = [
    // Classic Light
    {
        default: { start: '#ffffff', end: '#ffcce6', textColor: '#000000' },
        new: { start: '#ffffff', end: '#90eea8', textColor: '#000000' },
        sale: { start: '#ffffff', end: '#ffb3b3', textColor: '#000000' },
    },
    // Light Monochrome
    {
        default: { start: '#ffffff', end: '#cccccc', textColor: '#000000' },
        new: { start: '#ffffff', end: '#e6e6e6', textColor: '#000000' },
        sale: { start: '#ffffff', end: '#d9d9d9', textColor: '#000000' },
    },
    // Light Slate
    {
        default: { start: '#ffffff', end: '#d4e5e5', textColor: '#000000' },
        new: { start: '#ffffff', end: '#daeeed', textColor: '#000000' },
        sale: { start: '#ffffff', end: '#f1f1f3', textColor: '#000000' },
    },
];

export function GradientPicker({ themes, onChange, className }: GradientPickerProps) {
    const defaultTab = useMemo(() => 'presets', []);

    const getGradientStyle = (theme: Theme) => {
        return `linear-gradient(to right, ${theme.start}, ${theme.end})`;
    };

    return (
        <Card className={className}>
            <CardContent className="p-4">
                <Tabs defaultValue={defaultTab} className="w-full">
                    <TabsList className="w-full mb-4">
                        <TabsTrigger className="flex-1" value="presets">
                            Готовые схемы
                        </TabsTrigger>
                        <TabsTrigger className="flex-1" value="custom">
                            Настройка
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="presets" className="mt-0">
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <h3 className="text-sm font-medium">Темные темы</h3>
                                <div className="grid grid-cols-3 gap-2">
                                    {darkThemePresets.map((preset, index) => (
                                        <button
                                            key={index}
                                            className="p-0 h-auto aspect-square overflow-hidden rounded-md border border-input hover:bg-accent hover:text-accent-foreground"
                                            onClick={() => onChange(preset)}
                                        >
                                            <div className="w-full h-full grid grid-rows-3">
                                                <div style={{ background: getGradientStyle(preset.default) }} />
                                                <div style={{ background: getGradientStyle(preset.new) }} />
                                                <div style={{ background: getGradientStyle(preset.sale) }} />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h3 className="text-sm font-medium">Светлые темы</h3>
                                <div className="grid grid-cols-3 gap-2">
                                    {lightThemePresets.map((preset, index) => (
                                        <button
                                            key={index}
                                            className="p-0 h-auto aspect-square overflow-hidden rounded-md border border-input hover:bg-accent hover:text-accent-foreground"
                                            onClick={() => onChange(preset)}
                                        >
                                            <div className="w-full h-full grid grid-rows-3">
                                                <div style={{ background: getGradientStyle(preset.default) }} />
                                                <div style={{ background: getGradientStyle(preset.new) }} />
                                                <div style={{ background: getGradientStyle(preset.sale) }} />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="custom" className="mt-0">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Обычный ценник</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-xs mb-1 block">Начальный</label>
                                        <Input
                                            value={themes.default.start}
                                            className="h-8"
                                            onChange={(e) => onChange({
                                                ...themes,
                                                default: { ...themes.default, start: e.target.value }
                                            })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs mb-1 block">Конечный</label>
                                        <Input
                                            value={themes.default.end}
                                            className="h-8"
                                            onChange={(e) => onChange({
                                                ...themes,
                                                default: { ...themes.default, end: e.target.value }
                                            })}
                                        />
                                    </div>
                                </div>
                                <div className="h-6 rounded-md" style={{ background: getGradientStyle(themes.default) }} />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Новинка</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-xs mb-1 block">Начальный</label>
                                        <Input
                                            value={themes.new.start}
                                            className="h-8"
                                            onChange={(e) => onChange({
                                                ...themes,
                                                new: { ...themes.new, start: e.target.value }
                                            })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs mb-1 block">Конечный</label>
                                        <Input
                                            value={themes.new.end}
                                            className="h-8"
                                            onChange={(e) => onChange({
                                                ...themes,
                                                new: { ...themes.new, end: e.target.value }
                                            })}
                                        />
                                    </div>
                                </div>
                                <div className="h-6 rounded-md" style={{ background: getGradientStyle(themes.new) }} />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Распродажа</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-xs mb-1 block">Начальный</label>
                                        <Input
                                            value={themes.sale.start}
                                            className="h-8"
                                            onChange={(e) => onChange({
                                                ...themes,
                                                sale: { ...themes.sale, start: e.target.value }
                                            })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs mb-1 block">Конечный</label>
                                        <Input
                                            value={themes.sale.end}
                                            className="h-8"
                                            onChange={(e) => onChange({
                                                ...themes,
                                                sale: { ...themes.sale, end: e.target.value }
                                            })}
                                        />
                                    </div>
                                </div>
                                <div className="h-6 rounded-md" style={{ background: getGradientStyle(themes.sale) }} />
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
} 