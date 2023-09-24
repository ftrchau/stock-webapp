import "./App.css";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

import { QueryClient, QueryClientProvider } from "react-query";

import HomePage from "./pages/HomePage";
import DayTrade from "./pages/DayTrade";
import LongTermTrade from "./pages/LongTermTrade";

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
    path: "/stock-webapp/",
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "/stock-webapp/day-trade", element: <DayTrade /> }, // Update the path here
      {
        path: "/stock-webapp/long-term-trade",
        element: <LongTermTrade />,
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
