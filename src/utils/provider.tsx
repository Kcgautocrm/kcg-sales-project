"use client";

import React from "react";
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { Provider } from 'react-redux';
import Store from '@/store/store';
import AlertNotification from "@/components/notifications";

function Providers({ children }: React.PropsWithChildren) {
  const queryClient = new QueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={Store}>
        <AlertNotification />
        {children}
      </Provider>
    </QueryClientProvider>
  );
}

export default Providers;
