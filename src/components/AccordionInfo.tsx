// AccordionInfo.tsx
import type React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const AccordionInfo: React.FC = () => {
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="google-sheets-access">
        <AccordionTrigger>
          Проблемы с доступом к Google Таблицам?
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-2 text-left">
            <strong className="text-lg font-semibold">
              Откройте настройки доступа:
            </strong>
            <ol className="list-decimal list-inside space-y-2 ml-4 text-base">
              <li className="font-medium">
                В верхнем правом углу нажмите на кнопку "Настройки доступа".
              </li>
              <li className="font-medium">
                Нажмите на "Изменить" или "Доступ по ссылке" (в зависимости от
                текущих настроек).
              </li>
              <li className="font-medium">
                Убедитесь, что опция "Доступ по ссылке" включена.
              </li>
            </ol>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default AccordionInfo;
