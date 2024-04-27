/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import useStore from "@/app/states/store";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Console, Hook, Unhook } from "console-feed";
import { Message } from "console-feed/lib/definitions/Component";
import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";

function RightBar() {
  const { session, nodes, edges, alert, setAlertStore } = useStore(
    useShallow((state) => ({
      nodes: state.nodes,
      edges: state.edges,
      session: state.session,
      setSessionStore: state.setSession,
      alert: state.alert,
      setAlertStore: state.setAlert,
    })),
  );

  const [logs, setLogs] = useState<Message[]>([]);

  const onDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  const onDrop = (_event) => {
    return;
  };

  useEffect(() => {
    const hookedConsole = Hook(
      window.console,
      (log) => {
        if (log.method !== "debug" && log.method !== 'error') {
          setLogs((currLogs) => [
            ...currLogs,
            { ...log, id: currLogs.length.toString(), data: log.data || [] },
          ]);
        }
      },
      false,
    );
    return () => {
      Unhook(hookedConsole);
    };
  }, []);

  return (
    <aside
      className="col-span-1 flex h-full max-h-screen select-none flex-col justify-between border-l"
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <ScrollArea className="flex-1 mt-20">
        <Console logs={logs} variant="dark" />
      </ScrollArea>
    </aside>
  );
}

export default RightBar;
