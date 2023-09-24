import { Outlet } from "react-router-dom";
import { useCallback } from "react";
import { Button, ButtonGroup } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import classes from "./root.module.css";

function RootLayout() {
  const { i18n } = useTranslation();

  const changeLanguage = useCallback(
    (lng) => {
      i18n.changeLanguage(lng);
    },
    [i18n]
  );

  return (
    <>
      <main className={classes.main}>
        <ButtonGroup className={classes.switchLang}>
          <Button
            variant="light"
            active={i18n.language === "ch"}
            onClick={() => changeLanguage("ch")}
          >
            繁
          </Button>
          <Button
            variant="light"
            active={i18n.language === "sch"}
            onClick={() => changeLanguage("sch")}
          >
            简
          </Button>
          <Button
            variant="light"
            active={i18n.language === "en"}
            onClick={() => changeLanguage("en")}
          >
            EN
          </Button>
        </ButtonGroup>
        <Outlet />
      </main>
    </>
  );
}

export default RootLayout;
