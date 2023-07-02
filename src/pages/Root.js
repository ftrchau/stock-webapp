import { Outlet } from "react-router-dom";
import classes from "./root.module.css";

function RootLayout() {
  return (
    <>
      <main className={classes.main}>
        <Outlet />
      </main>
    </>
  );
}

export default RootLayout;
