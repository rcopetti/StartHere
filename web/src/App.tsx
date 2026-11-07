/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppProvider } from './context/AppContext';
import { DevicePreviewShell } from './components/DevicePreviewShell';

export default function App() {
  return (
    <AppProvider>
      <DevicePreviewShell />
    </AppProvider>
  );
}
