import { expect, it } from 'vite-plus/test';

import * as icons from './index';
import * as publicSurface from '../index';

const curatedIconNames = [
  'AlertCircleIcon',
  'AlertTriangleIcon',
  'ArrowLeftIcon',
  'ArrowRightIcon',
  'BellIcon',
  'CheckIcon',
  'ChevronDownIcon',
  'ChevronLeftIcon',
  'ChevronRightIcon',
  'ChevronUpIcon',
  'CopyIcon',
  'DownloadIcon',
  'EditIcon',
  'ExternalLinkIcon',
  'EyeIcon',
  'EyeOffIcon',
  'FilterIcon',
  'HomeIcon',
  'InfoIcon',
  'Loader2Icon',
  'Menu2Icon',
  'MinusIcon',
  'PlusIcon',
  'RefreshIcon',
  'SearchIcon',
  'SettingsIcon',
  'TrashIcon',
  'UploadIcon',
  'UserIcon',
  'XIcon',
] as const;

it('exports the curated Tabler icon set only', () => {
  expect(Object.keys(icons).sort()).toEqual([...curatedIconNames].sort());
});

it('keeps the root public surface to types plus curated icons', () => {
  expect(Object.keys(publicSurface).sort()).toEqual([...curatedIconNames].sort());
});
