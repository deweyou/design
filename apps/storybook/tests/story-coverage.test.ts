import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { expect, test } from 'vite-plus/test';

const storybookRoot = resolve(import.meta.dirname, '..');
const storiesRoot = resolve(storybookRoot, 'src/stories');

const readStorybookFile = (path: string) => {
  return readFileSync(resolve(storybookRoot, path), 'utf8');
};

const extractStoryObject = (source: string, storyName: string) => {
  const declarationStart = source.indexOf(`export const ${storyName}`);

  if (declarationStart === -1) {
    return '';
  }

  const declarationBodyStart = source.indexOf('{', declarationStart);

  if (declarationBodyStart === -1) {
    return '';
  }

  let depth = 1;
  let index = declarationBodyStart + 1;

  for (; index < source.length; index += 1) {
    if (source[index] === '{') {
      depth += 1;
      continue;
    }

    if (source[index] === '}') {
      depth -= 1;

      if (depth === 0) {
        return source.slice(declarationStart, index + 1);
      }
    }
  }

  return '';
};

test('Nav and Field stories include interaction play functions', () => {
  const fieldStory = readStorybookFile('src/stories/Field.stories.tsx');
  const navStory = readStorybookFile('src/stories/Nav.stories.tsx');

  expect(fieldStory).toContain('play: async');
  expect(fieldStory).toContain('within(canvasElement)');
  expect(navStory).toContain('play: async');
  expect(navStory).toContain('Responsive navigation');
});

test('preview can render full viewport stories outside the centered layout frame', () => {
  const preview = readStorybookFile('.storybook/preview.ts');

  expect(preview).toContain('context.parameters.fullViewport');
  expect(preview).toContain("layout: 'fullscreen'");
});

test('preview exposes the component locale through a global toolbar and provider', () => {
  const preview = readStorybookFile('.storybook/preview.ts');

  expect(preview).toContain('context.globals.locale');
  expect(preview).toContain('configLocales.map');
  expect(preview).toContain('ConfigProvider');
  expect(preview).toContain('Suspense');
});

test('DatePicker stories use the global locale instead of a dedicated locale gallery', () => {
  const datePickerStory = readStorybookFile('src/stories/DatePicker.stories.tsx');

  expect(datePickerStory).not.toContain('export const Locales');
  expect(datePickerStory).not.toContain("locale: 'en-US'");
  expect(datePickerStory).not.toContain('locale="en-US"');
});

test('DatePicker stories expose the paired format and parse contract', () => {
  const datePickerStory = readStorybookFile('src/stories/DatePicker.stories.tsx');
  const formatAndParseStory = extractStoryObject(datePickerStory, 'FormatAndParse');

  expect(formatAndParseStory).toContain('format: dayFirstSlashFormat');
  expect(formatAndParseStory).toContain('parse: dayFirstSlashParse');
  expect(formatAndParseStory).toContain('CalendarDate');
});

test('DatePicker stories expose date, month, and year selection modes', () => {
  const datePickerStory = readStorybookFile('src/stories/DatePicker.stories.tsx');
  const modesStory = extractStoryObject(datePickerStory, 'Modes');
  const dateModeStory = extractStoryObject(datePickerStory, 'DateMode');
  const monthModeStory = extractStoryObject(datePickerStory, 'MonthMode');
  const yearModeStory = extractStoryObject(datePickerStory, 'YearMode');

  expect(datePickerStory).toContain('mode: {');
  expect(datePickerStory).toContain("options: ['date', 'month', 'year']");
  expect(datePickerStory).toContain("defaultValue: { summary: 'date' }");
  expect(modesStory).toContain('mode="month"');
  expect(modesStory).toContain('mode="year"');
  expect(dateModeStory).toContain("mode: 'date'");
  expect(monthModeStory).toContain("mode: 'month'");
  expect(monthModeStory).toContain('play: async');
  expect(monthModeStory).toContain("name: '2027'");
  expect(yearModeStory).toContain("mode: 'year'");
  expect(yearModeStory).toContain('play: async');
  expect(yearModeStory).toContain("name: '2028'");
});

test('DatePicker docs expose named locale overrides and full-surface sizing', () => {
  const datePickerStory = readStorybookFile('src/stories/DatePicker.stories.tsx');

  expect(datePickerStory).toContain("summary: 'DatePickerLocaleTextOverrides'");
  expect(datePickerStory).toContain('Controls the density of both the field and calendar panel.');
});

test('picker docs expose Today as an explicit opt-in action', () => {
  const datePickerStory = readStorybookFile('src/stories/DatePicker.stories.tsx');

  expect(datePickerStory).toContain('showToday: {');
  expect(datePickerStory).toContain("defaultValue: { summary: 'false' }");
  expect(extractStoryObject(datePickerStory, 'Interaction')).toContain('showToday');
  expect(extractStoryObject(datePickerStory, 'ShowTimeInteraction')).toContain('showToday: true');
});

test('DatePicker stories cover boolean and configured showTime behavior', () => {
  const datePickerStory = readStorybookFile('src/stories/DatePicker.stories.tsx');
  const showTimeStory = extractStoryObject(datePickerStory, 'ShowTime');
  const configuredStory = extractStoryObject(datePickerStory, 'ShowTimeConfigured');
  const formatStory = extractStoryObject(datePickerStory, 'ShowTimeFormatAndParse');
  const interactionStory = extractStoryObject(datePickerStory, 'ShowTimeInteraction');

  expect(datePickerStory).toContain("summary: 'boolean | DatePickerTimeOptions'");
  expect(showTimeStory).toContain('showTime: true');
  expect(configuredStory).toContain("granularity: 'second'");
  expect(configuredStory).toContain('minuteStep: 15');
  expect(formatStory).toContain('format: dottedDateTimeFormat');
  expect(formatStory).toContain('parse: dottedDateTimeParse');
  expect(formatStory).toContain('CalendarDateTime');
  expect(interactionStory).toContain("name: 'Hour'");
  expect(interactionStory).toContain("name: 'Minute'");
  expect(interactionStory).toContain("name: 'Confirm'");
});

test('DateRangePicker stories cover unified fields, modes, time, and interactions', () => {
  const dateRangePickerStory = readStorybookFile('src/stories/DateRangePicker.stories.tsx');
  const modesStory = extractStoryObject(dateRangePickerStory, 'Modes');
  const configuredStory = extractStoryObject(dateRangePickerStory, 'ShowTimeConfigured');
  const interactionStory = extractStoryObject(dateRangePickerStory, 'Interaction');
  const timeInteractionStory = extractStoryObject(dateRangePickerStory, 'ShowTimeInteraction');

  expect(dateRangePickerStory).toContain("title: 'Components/DateRangePicker'");
  expect(dateRangePickerStory).toContain('two real inputs in one visual field');
  expect(dateRangePickerStory).toContain("summary: 'boolean | DateRangePickerTimeOptions'");
  expect(modesStory).toContain('mode="month"');
  expect(modesStory).toContain('mode="year"');
  expect(configuredStory).toContain('showNow: true');
  expect(configuredStory).toContain('defaultTime:');
  expect(interactionStory).toContain('Start date');
  expect(interactionStory).toContain('End date');
  expect(timeInteractionStory).toContain("name: 'Hour'");
  expect(timeInteractionStory).toContain("name: 'Confirm'");
});

test('controls-oriented stories expose an args-driven Default playground', () => {
  const storyFiles = readdirSync(storiesRoot)
    .filter((file) => file.endsWith('.stories.tsx'))
    .sort();

  for (const storyFile of storyFiles) {
    const source = readFileSync(resolve(storiesRoot, storyFile), 'utf8');

    if (!source.includes('argTypes:')) {
      continue;
    }

    const defaultStory = extractStoryObject(source, 'Default');

    expect(
      defaultStory,
      `${storyFile} should export Default when argTypes are documented`,
    ).not.toBe('');
    expect(defaultStory, `${storyFile} Default should provide initial args`).toContain('args:');

    if (defaultStory.includes('render:')) {
      expect(
        /render\s*:\s*(?:\(?\s*(args|\{)|[A-Za-z_$][\w$]*\.render)/.test(defaultStory),
        `${storyFile} Default custom render should receive Storybook args`,
      ).toBe(true);
    }
  }
});
