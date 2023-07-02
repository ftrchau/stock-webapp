import "./App.css";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

import { QueryClient, QueryClientProvider } from "react-query";

import HomePage from "./pages/HomePage";
import DayTrade from "./pages/DayTrade";
import LongTermTrade from "./pages/LongTermTrade";
import Test from "./pages/Test";

import RootLayout from "./pages/Root";

import "bootstrap/dist/css/bootstrap.min.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      networkMode: "always",
      refetchOnWindowFocus: false,
      retry: 1,
      retryDelay: 500,
    },
  },
});

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "day-trade", element: <DayTrade /> },
      {
        path: "/long-term-trade",
        element: <LongTermTrade />,
      },
      {
        path: "/test",
        element: <Test />,
      },
    ],
  },
]);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

export default App;
