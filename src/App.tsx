import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { faSun } from "@fortawesome/free-regular-svg-icons";
import { faMoon } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classnames from "classnames";
import { ChangeEvent, useState } from "react";
import { Compile, RenderContext, parse } from "velocityjs";

import Styles from "@/App.module.css";
import { DEFAULT_TEXT_DATA, DEFAULT_TEXT_TEMPLATE } from "@/default_values.ts";

function App() {
  const [isDarkMode, setIsDarkMode] = useState(detectPrefersDarkMode());
  const [tabIndexInput, setTabIndexInput] = useState(1);
  const [textData, setTextData] = useState(DEFAULT_TEXT_DATA);
  const [textTemplate, setTextTemplate] = useState(DEFAULT_TEXT_TEMPLATE);

  applyDarkMode(isDarkMode);

  let textInput = textData;
  if (tabIndexInput === 1) {
    textInput = textTemplate;
  }

  function updateTextInput(e: ChangeEvent<HTMLTextAreaElement>) {
    const text = e.target.value;
    if (tabIndexInput === 0) {
      setTextData(text);
    } else {
      setTextTemplate(text);
    }
  }

  const output = compile(textData, textTemplate);

  return (
    <>
      <nav className="navbar is-info">
        <div className="navbar-brand">
          <h2 className="navbar-item title">Live VTL Simulator</h2>
        </div>
        <div className="navbar-end">
          <div className="navbar-item">
            <span
              className={classnames(
                Styles.NavbarIcon,
                Styles.CursorPointer,
                "icon",
                "mr-5",
              )}
              onClick={() => setIsDarkMode(!isDarkMode)}
            >
              <FontAwesomeIcon icon={isDarkMode ? faMoon : faSun} />
            </span>
            <a
              href="https://github.com/sinofseven/live-vtl-simulator"
              target="_blank"
              rel="noreferrer noopener"
              className={classnames(
                Styles.NavbarIcon,
                "icon",
                "has-text-black",
              )}
            >
              <FontAwesomeIcon icon={faGithub} />
            </a>
          </div>
        </div>
      </nav>
      <div className="container is-widescreen pt-5">
        <div className="columns">
          <div className="column">
            <div className="tabs">
              <ul>
                <li
                  className={classnames({ "is-active": tabIndexInput === 0 })}
                >
                  <a onClick={() => setTabIndexInput(0)}>data.json</a>
                </li>
                <li
                  className={classnames({ "is-active": tabIndexInput === 1 })}
                >
                  <a onClick={() => setTabIndexInput(1)}>template.vtl</a>
                </li>
              </ul>
            </div>
            <textarea
              className={classnames("textarea", Styles.Editor)}
              value={textInput}
              onChange={updateTextInput}
            />
          </div>
          <div className="column">
            <div className="tabs">
              <ul>
                <li className="is-active">
                  <a>{output.titleOutput}</a>
                </li>
              </ul>
            </div>
            <textarea
              className={classnames("textarea", Styles.Editor, {
                "is-danger": output.isError,
              })}
              readOnly
              value={output.textOutput}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default App;

function compile(
  textData: string,
  textTemplate: string,
): { textOutput: string; titleOutput: string; isError: boolean } {
  let data: unknown = null;
  try {
    data = JSON.parse(textData);
  } catch (e) {
    const error = e as Error;
    return {
      textOutput: error.stack ?? error.message,
      titleOutput: "JSON Parse Error",
      isError: true,
    };
  }

  try {
    const textOutput = new Compile(parse(textTemplate)).render(
      data as RenderContext,
    );
    return {
      textOutput,
      titleOutput: "Result",
      isError: false,
    };
  } catch (e) {
    const error = e as Error;
    return {
      textOutput: error.stack ?? error.message,
      titleOutput: "Template Compile Error",
      isError: true,
    };
  }
}

function detectPrefersDarkMode(): boolean {
  const match = window.matchMedia("(prefers-color-scheme: dark)");
  return match.matches;
}

function applyDarkMode(isDarkMode: boolean) {
  const elm = document.getElementsByTagName("html")[0];
  elm.setAttribute("data-theme", isDarkMode ? "dark" : "light");
}
