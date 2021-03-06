import { ToggleView as view } from './Toggle.view';
import { ToggleStyles as styles, ToggleTokens as tokens } from './Toggle.styles';
import { ToggleState as state } from './Toggle.state';
import { IToggleProps, IToggleViewProps, IToggleStyles, IToggleTokens } from './Toggle.types';
import { createComponent } from '../../Foundation';

export const Toggle: React.StatelessComponent<IToggleProps> = createComponent<IToggleProps, IToggleViewProps, IToggleTokens, IToggleStyles>(
  {
    displayName: 'Toggle',
    view,
    state,
    styles,
    tokens
  }
);
