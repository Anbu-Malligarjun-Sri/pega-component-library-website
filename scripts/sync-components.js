import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const componentsDir = path.join(rootDir, 'Components');

const meta = {
  Pega_Extensions_SplitFlapText: {
    id: 'split-flap-text',
    name: 'Split Flap Text',
    type: 'Animation',
    status: 'Stable',
    accent: 'indigo',
    icon: '⌁',
    version: 'v5.0.4',
    description: 'Displays animated text using split-flap style character tiles. Perfect for prominent status, readiness, or announcement text in your Constellation pages.',
    features: ['Single text animation', 'Dynamic tile length', 'Configurable styling', 'Pega Cosmos ready'],
    deps: ['react', 'styled-components', '@pega/cosmos-react-core'],
    instructions: {
      title: 'Split Flap Text — Integration Guide',
      deps: ['react', 'styled-components', '@pega/cosmos-react-core'],
      steps: [
        'Add the <code>Split Flap Text</code> widget to a page or case view in App Studio.',
        'Set the <code>text</code> property (e.g. <code>LAUNCH READY</code>).',
        'The tile count automatically adjusts to the text length, animating each tile upon rendering.'
      ]
    }
  },
  Pega_Extensions_SplitFlapTextField: {
    id: 'split-flap-text-field',
    name: 'Split Flap Text Field',
    type: 'Field',
    status: 'New',
    accent: 'violet',
    icon: '⌨',
    version: 'v5.0.4',
    description: 'A text field with an animated split-flap preview beneath the editable input. Binds to a case text property and updates the animation dynamically as you type.',
    features: ['Live typing preview', 'Property two-way binding', 'Helper & validation messages', 'Customizable tiles'],
    deps: ['react', 'styled-components', '@pega/cosmos-react-core'],
    instructions: {
      title: 'Split Flap Text Field — Integration Guide',
      deps: ['react', 'styled-components', '@pega/cosmos-react-core'],
      steps: [
        'Use this field in any form where case workers need to enter or update text.',
        'Binds directly to standard Pega text properties through <code>getPConnect().getActionsApi()</code>.',
        'As the user types, the split-flap preview below dynamically syncs and animates.'
      ]
    }
  },
  Pega_Extensions_ProfileCard: {
    id: 'profile-card',
    name: 'Profile Card',
    type: 'Display',
    status: 'Updated',
    accent: 'cyan',
    icon: '⊕',
    version: 'v5.0.4',
    description: 'A polished profile card featuring 3D hover tilt, direct/asset image loading, case attachment downloads, initials fallback, and configurable status/handle metadata.',
    features: ['3D interactive tilt', 'Attachment category & name loader', 'Property references (@P .Property)', 'Initials fallback'],
    deps: ['react', 'styled-components', '@pega/cosmos-react-core'],
    instructions: {
      title: 'Profile Card — Integration Guide',
      deps: ['react', 'styled-components', '@pega/cosmos-react-core'],
      steps: [
        'Map <code>name</code>, <code>title</code>, <code>handle</code>, and <code>status</code> to case properties or scalar text.',
        'For images: use a direct URL, Pega asset key in <code>imageProperty</code>, or set <code>imageAttachmentCategory</code> to download the latest case attachment.',
        'Features smooth 3D tilt response on pointer movement with reduced-motion accessibility.'
      ]
    }
  },
  Pega_Extensions_Calendar: {
    id: 'calendar',
    name: 'Calendar',
    type: 'Widget',
    status: 'Stable',
    accent: 'green',
    icon: '📅',
    version: 'v5.0.4',
    description: 'A complete scheduling widget supporting Monthly, Weekly, and Daily views, date navigation, slot timing, weekend toggles, and direct case event creation.',
    features: ['Month, Week & Day views', 'Data Page list integration', 'Configurable day slot hours', 'Quick event creator'],
    deps: ['react', 'styled-components', '@pega/cosmos-react-core'],
    instructions: {
      title: 'Calendar Widget — Integration Guide',
      deps: ['react', 'styled-components', '@pega/cosmos-react-core'],
      steps: [
        'Provide a List Data Page that returns case instances with date and time properties.',
        'Configure <code>dateProperty</code>, <code>startTimeProperty</code>, and <code>endTimeProperty</code>.',
        'Supports <code>createClassname</code> to trigger new case creation directly from the calendar.'
      ]
    }
  },
  Pega_Extensions_MapboxAddressField: {
    id: 'mapbox-address-field',
    name: 'Mapbox Address Field',
    type: 'Field',
    status: 'New',
    accent: 'amber',
    icon: '📍',
    version: 'v5.0.4',
    description: 'A single-line address field powered by Mapbox Geocoding and browser geolocation ("Locate") for fast address entry in Constellation forms.',
    features: ['Mapbox Places geocoding', 'Browser "Locate" GPS integration', 'Auto error/validation handling', 'Single property binding'],
    deps: ['react', 'styled-components', '@pega/cosmos-react-core'],
    instructions: {
      title: 'Mapbox Address Field — Integration Guide',
      deps: ['react', 'styled-components', '@pega/cosmos-react-core'],
      steps: [
        'Add to your Constellation form and bind to an address text property.',
        'Configure your restricted public Mapbox token (<code>pk...</code>) in the component configuration.',
        'Case workers can type an address and hit Search or click "Locate" to fill their current location automatically.'
      ]
    }
  },
  Pega_Extensions_MapboxAddressPicker: {
    id: 'mapbox-address-picker',
    name: 'Mapbox Address Picker',
    type: 'Location',
    status: 'New',
    accent: 'emerald',
    icon: '🗺',
    version: 'v5.0.4',
    description: 'A complete map-based address selector with interactive Mapbox GL map, draggable pin, search bar, and automatic reverse-geocoding into 7 Pega case properties.',
    features: ['Interactive Mapbox GL map', 'Draggable marker with reverse geocoding', 'Current location GPS', '7 Pega property bindings'],
    deps: ['react', 'styled-components', '@pega/cosmos-react-core'],
    instructions: {
      title: 'Mapbox Address Picker — Integration Guide',
      deps: ['react', 'styled-components', '@pega/cosmos-react-core'],
      steps: [
        'Place the widget in a Case or Page view in Constellation.',
        'Enter your restricted public Mapbox token (<code>pk...</code>).',
        'Map case properties for Address Line 1, City, State, Country, Postal Code, Latitude, and Longitude.',
        'Searching, dragging the pin, or using current location automatically populates all 7 fields in the case!'
      ]
    }
  }
};

const getLang = (filename) => {
  if (filename.endsWith('.tsx')) return 'tsx';
  if (filename.endsWith('.jsx')) return 'jsx';
  if (filename.endsWith('.ts')) return 'ts';
  if (filename.endsWith('.js')) return 'js';
  if (filename.endsWith('.css')) return 'css';
  if (filename.endsWith('.json')) return 'json';
  if (filename.endsWith('.mdx')) return 'mdx';
  return 'text';
};

const components = Object.keys(meta).map((dirName) => {
  const dirPath = path.join(componentsDir, dirName);
  const info = meta[dirName];
  const fileNames = fs.readdirSync(dirPath);
  const sortOrder = [
    'index.tsx',
    'SplitFlapText.jsx',
    'styles.ts',
    'config.json',
    'Docs.mdx',
    'demo.stories.tsx',
    'demo.test.tsx',
    'SplitFlapText.css',
    'localizations.json'
  ];
  fileNames.sort((a, b) => {
    const ia = sortOrder.indexOf(a) >= 0 ? sortOrder.indexOf(a) : 99;
    const ib = sortOrder.indexOf(b) >= 0 ? sortOrder.indexOf(b) : 99;
    return ia - ib || a.localeCompare(b);
  });

  const files = fileNames.map((fileName) => {
    const filePath = path.join(dirPath, fileName);
    const content = fs.readFileSync(filePath, 'utf-8');
    return {
      name: fileName,
      lang: getLang(fileName),
      content
    };
  });

  return {
    ...info,
    componentDir: dirName,
    files
  };
});

const outPath = path.join(rootDir, 'src', 'componentsData.js');
const jsContent =
  '/* Auto-generated from Components directory — Exact source files */\nexport const COMPONENTS = ' +
  JSON.stringify(components, null, 2) +
  ';\n';
fs.writeFileSync(outPath, jsContent, 'utf-8');
console.log(`[sync-components] Successfully synced ${components.length} components into src/componentsData.js`);
