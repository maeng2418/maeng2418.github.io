import React, { useEffect, useState } from 'react';
import { THEME } from '../../constants';
import * as Dom from '../../utils/dom';
import * as Storage from '../../utils/storage';
import './index.scss';
import MoonOutlined from './MoonOutlined';
import SunnyOutlined from './SunnyOutlined';

function getTheme(checked: boolean) {
  return checked ? THEME.DARK : THEME.LIGHT;
}

function toggleTheme(theme: ReturnType<typeof getTheme>) {
  switch (theme) {
    case THEME.LIGHT: {
      Dom.addClassToBody(THEME.LIGHT);
      Dom.removeClassToBody(THEME.DARK);
      break;
    }
    case THEME.DARK: {
      Dom.addClassToBody(THEME.DARK);
      Dom.removeClassToBody(THEME.LIGHT);
      break;
    }
  }
}

const ThemeSwitch: React.FC = () => {
  const [checked, setChecked] = useState(false);

  const onClickThemeButton = () => {
    const value = !checked;
    const theme = getTheme(value);
    Storage.setTheme(value);
    setChecked(value);
    toggleTheme(theme);
  };

  useEffect(() => {
    const checked = Storage.getTheme(Dom.hasClassOfBody(THEME.DARK));

    const theme = getTheme(checked);
    Storage.setTheme(checked);
    setChecked(checked);
    toggleTheme(theme);
  }, []);

  return (
    <div className="switch-container">
      {checked ? (
        <div className="icon checkedIcon">
          <MoonOutlined width={24} height={24} onClick={onClickThemeButton} />
        </div>
      ) : (
        <div className="icon uncheckedIcon">
          <SunnyOutlined width={24} height={24} onClick={onClickThemeButton} />
        </div>
      )}
    </div>
  );
};

export default ThemeSwitch;
