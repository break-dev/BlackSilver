import { Tabs, rem } from "@mantine/core";
import {
  UserGroupIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";

import { useTitlePage } from "../../../hooks/useTitlePage";
import { TabEmpleados } from "./tab-empleados";
import { TabContratistas } from "./tab-contratistas";

export const PersonalPage = () => {
  useTitlePage("Gestión de Personal");

  const iconStyle = { width: rem(18), height: rem(18) };

  return (
    <div className="animate-fade-in">
      <Tabs
        defaultValue="empleados"
        variant="pills"
        classNames={{
          root: "space-y-6",
          list: "bg-zinc-900/50 p-1 rounded-2xl border border-zinc-800 w-fit",
          tab: "rounded-xl px-6 py-2.5 transition-all duration-300 data-[active]:bg-indigo-600 data-[active]:text-white text-zinc-400 hover:text-zinc-200",
        }}
      >
        <Tabs.List>
          <Tabs.Tab
            value="empleados"
            leftSection={<UserGroupIcon style={iconStyle} />}
          >
            Empleados de Empresa
          </Tabs.Tab>
          <Tabs.Tab
            value="contratistas"
            leftSection={<WrenchScrewdriverIcon style={iconStyle} />}
          >
            Contratistas Mineros
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="empleados">
          <TabEmpleados />
        </Tabs.Panel>

        <Tabs.Panel value="contratistas">
          <TabContratistas />
        </Tabs.Panel>
      </Tabs>
    </div>
  );
};

export default PersonalPage;
