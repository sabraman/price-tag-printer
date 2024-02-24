// AccordionInfo.tsx
import React from "react";
import {
  Accordion,
  AccordionItem,
  AccordionItemHeading,
  AccordionItemButton,
  AccordionItemPanel,
} from "react-accessible-accordion";
import "../App.css"; // Импортируйте стили библиотеки
import "react-accessible-accordion/dist/fancy-example.css";

const AccordionInfo: React.FC = () => {
  return (
    <Accordion allowZeroExpanded>
      <AccordionItem>
        <AccordionItemHeading>
          <AccordionItemButton>
            Проблемы с доступом к Google Таблицам?
          </AccordionItemButton>
        </AccordionItemHeading>
        <AccordionItemPanel>
          <strong>Откройте настройки доступа:</strong>
          <ol>
            <li>
              В верхнем правом углу нажмите на кнопку "Настройки доступа".
            </li>

            <li>
              Нажмите на "Изменить" или "Доступ по ссылке" (в зависимости от
              текущих настроек).
            </li>
            <li>Убедитесь, что опция "Доступ по ссылке" включена.</li>
          </ol>
        </AccordionItemPanel>
      </AccordionItem>
    </Accordion>
  );
};

export default AccordionInfo;
