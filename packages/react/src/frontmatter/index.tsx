import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
  type ReactNode,
} from 'react';
import {
  AddIcon,
  CalendarEventIcon,
  CalendarIcon,
  CheckIcon,
  CheckRectangleIcon,
  HashtagIcon,
  ListDemandIcon,
  TagIcon,
  TextIcon,
  TrashIcon,
  XIcon,
} from '@deweyou-design/react-icons';
import classNames from 'classnames';
import { stringify } from 'yaml';

import { Badge } from '../badge/index.tsx';
import { Button, IconButton } from '../button/index.tsx';
import { Checkbox } from '../checkbox/index.tsx';
import { CheckboxMark } from '../checkbox-mark/index.tsx';
import {
  DatePicker,
  type DatePickerDateTimeValue,
  type DatePickerTimeGranularity,
  type DatePickerValue,
  parseDatePickerDateTimeValue,
  parseDatePickerValue,
} from '../date-picker/index.tsx';
import { Input } from '../input/index.tsx';
import { Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from '../menu/index.tsx';
import { NumberInput } from '../number-input/index.tsx';
import { Textarea } from '../textarea/index.tsx';
import { Tooltip } from '../tooltip/index.tsx';

import styles from './index.module.less';
import { useFrontmatterLocaleText } from './locale/loader.ts';
import type { FrontmatterLocaleText } from './locale/types.ts';

export type FrontmatterScalar = string | number | boolean | null;
export type FrontmatterValue =
  | FrontmatterScalar
  | FrontmatterValue[]
  | { [key: string]: FrontmatterValue };
export type FrontmatterRecord = Record<string, FrontmatterValue>;

export const frontmatterPropertyTypeOptions = [
  'text',
  'list',
  'number',
  'checkbox',
  'date',
  'datetime',
  'tags',
] as const;

export type FrontmatterPropertyType = (typeof frontmatterPropertyTypeOptions)[number];
export type FrontmatterValueType = 'string' | 'number' | 'boolean' | 'null' | 'array' | 'object';
export type FrontmatterTypeSource = 'explicit' | 'builtin' | 'inferred';
export type FrontmatterMode = 'properties' | 'source';
export type FrontmatterPropertyTypes = Readonly<Record<string, FrontmatterPropertyType>>;

export type FrontmatterChangeAction = 'add' | 'delete' | 'rename' | 'set';

export type FrontmatterChangeDetails = {
  action: FrontmatterChangeAction;
  frontmatter: FrontmatterRecord;
  key: string;
  path: readonly (string | number)[];
  previousKey?: string;
  value: FrontmatterValue;
};

export type FrontmatterPropertyTypeChangeDetails = {
  key: string;
  type: FrontmatterPropertyType;
};

export type FrontmatterRenderValueContext = {
  defaultNode: ReactNode;
  editable: boolean;
  key: string;
  path: readonly (string | number)[];
  propertyType?: FrontmatterPropertyType;
  typeSource?: FrontmatterTypeSource;
  value: FrontmatterValue;
  valueType: FrontmatterValueType;
};

export type FrontmatterNumberPropertyOptions = {
  max?: number;
  min?: number;
  precision?: number;
  step?: number;
};

export type FrontmatterPropertyOptions = {
  editable?: boolean;
  number?: FrontmatterNumberPropertyOptions;
  placeholder?: string;
};

export type FrontmatterPropertyOptionsMap = Readonly<Record<string, FrontmatterPropertyOptions>>;

export type FrontmatterProps = {
  value?: FrontmatterRecord;
  source?: string;
  error?: string;
  editable?: boolean;
  label?: ReactNode;
  mode?: FrontmatterMode;
  showSourceToggle?: boolean;
  propertyTypes?: FrontmatterPropertyTypes;
  propertyOptions?: FrontmatterPropertyOptionsMap;
  onChange?: (details: FrontmatterChangeDetails) => void;
  onModeChange?: (mode: FrontmatterMode) => void;
  onPropertyTypeChange?: (details: FrontmatterPropertyTypeChangeDetails) => void;
  onSourceChange?: (source: string) => void;
  renderValue?: (context: FrontmatterRenderValueContext) => ReactNode;
  localeText?: Partial<FrontmatterLocaleText>;
  className?: string;
  style?: CSSProperties;
};

type ResolvedPropertyType = {
  propertyType?: FrontmatterPropertyType;
  typeSource?: FrontmatterTypeSource;
};

const renderPropertyTypeIcon = (propertyType: FrontmatterPropertyType) => {
  const iconProps = { 'aria-hidden': true, size: '1em' } as const;

  switch (propertyType) {
    case 'checkbox':
      return <CheckRectangleIcon {...iconProps} />;
    case 'date':
      return <CalendarIcon {...iconProps} />;
    case 'datetime':
      return <CalendarEventIcon {...iconProps} />;
    case 'list':
      return <ListDemandIcon {...iconProps} />;
    case 'number':
      return <HashtagIcon {...iconProps} />;
    case 'tags':
      return <TagIcon {...iconProps} />;
    case 'text':
      return <TextIcon {...iconProps} />;
  }
};

const getValueType = (value: FrontmatterValue): FrontmatterValueType => {
  if (value === null) {
    return 'null';
  }

  if (Array.isArray(value)) {
    return 'array';
  }

  return typeof value as Exclude<FrontmatterValueType, 'null' | 'array'>;
};

const isScalarList = (value: FrontmatterValue): value is FrontmatterScalar[] =>
  Array.isArray(value) &&
  value.every(
    (entry) =>
      entry === null ||
      typeof entry === 'string' ||
      typeof entry === 'number' ||
      typeof entry === 'boolean',
  );

const isTagList = (value: FrontmatterValue): value is string[] =>
  Array.isArray(value) && value.every((entry) => typeof entry === 'string');

type FrontmatterDatePropertyType = Extract<FrontmatterPropertyType, 'date' | 'datetime'>;

const parseFrontmatterDateValue = (
  value: string,
  propertyType: FrontmatterDatePropertyType,
): DatePickerValue | DatePickerDateTimeValue | null | undefined => {
  if (value === '') {
    return null;
  }

  try {
    return propertyType === 'date'
      ? parseDatePickerValue(value)
      : parseDatePickerDateTimeValue(value);
  } catch {
    return undefined;
  }
};

const padDatePart = (value: number, length = 2) => String(value).padStart(length, '0');

const serializeFrontmatterDateValue = (
  value: Pick<DatePickerValue | DatePickerDateTimeValue, 'day' | 'month' | 'year'>,
) => `${padDatePart(value.year, 4)}-${padDatePart(value.month)}-${padDatePart(value.day)}`;

const serializeFrontmatterDateTimeValue = (
  value: DatePickerDateTimeValue,
  granularity: DatePickerTimeGranularity,
) =>
  `${serializeFrontmatterDateValue(value)}T${padDatePart(value.hour)}:${padDatePart(value.minute)}${
    granularity === 'second' ? `:${padDatePart(value.second)}` : ''
  }`;

const resolvePropertyType = (
  key: string,
  value: FrontmatterValue,
  propertyTypes: FrontmatterPropertyTypes | undefined,
): ResolvedPropertyType => {
  const explicitType = propertyTypes?.[key];

  if (explicitType) {
    return { propertyType: explicitType, typeSource: 'explicit' };
  }

  if (key === 'tags') {
    return { propertyType: 'tags', typeSource: 'builtin' };
  }

  if (key === 'aliases' || key === 'cssclasses') {
    return { propertyType: 'list', typeSource: 'builtin' };
  }

  if (typeof value === 'string') {
    return { propertyType: 'text', typeSource: 'inferred' };
  }

  if (typeof value === 'number') {
    return { propertyType: 'number', typeSource: 'inferred' };
  }

  if (typeof value === 'boolean') {
    return { propertyType: 'checkbox', typeSource: 'inferred' };
  }

  if (isScalarList(value)) {
    return { propertyType: 'list', typeSource: 'inferred' };
  }

  return {};
};

const isValueCompatible = (
  value: FrontmatterValue,
  propertyType: FrontmatterPropertyType | undefined,
) => {
  switch (propertyType) {
    case 'text':
      return typeof value === 'string';
    case 'date':
    case 'datetime':
      return (
        typeof value === 'string' && parseFrontmatterDateValue(value, propertyType) !== undefined
      );
    case 'number':
      return typeof value === 'number';
    case 'checkbox':
      return typeof value === 'boolean';
    case 'list':
      return isScalarList(value);
    case 'tags':
      return isTagList(value);
    default:
      return false;
  }
};

const formatScalar = (value: FrontmatterScalar) => {
  if (value === null) {
    return 'null';
  }

  return String(value);
};

type ResolvedEditedScalar = { isValid: false } | { isValid: true; value: FrontmatterScalar };

const resolveEditedScalar = (
  currentValue: FrontmatterScalar,
  nextDraft: string,
): ResolvedEditedScalar => {
  if (typeof currentValue === 'number') {
    const nextNumber = Number(nextDraft);
    return Number.isFinite(nextNumber) ? { isValid: true, value: nextNumber } : { isValid: false };
  }

  if (typeof currentValue === 'boolean') {
    if (nextDraft === 'true') {
      return { isValid: true, value: true };
    }
    if (nextDraft === 'false') {
      return { isValid: true, value: false };
    }

    return { isValid: false };
  }

  if (currentValue === null) {
    return nextDraft === 'null' || nextDraft === '~'
      ? { isValid: true, value: null }
      : { isValid: false };
  }

  return { isValid: true, value: nextDraft };
};

const createDefaultPropertyValue = (propertyType: FrontmatterPropertyType): FrontmatterValue => {
  switch (propertyType) {
    case 'checkbox':
      return false;
    case 'number':
      return 0;
    case 'list':
    case 'tags':
      return [];
    case 'date':
    case 'datetime':
    case 'text':
      return '';
  }
};

const renderSourceValue = (value: FrontmatterValue) => (
  <code className={styles.sourceValue}>{stringify(value).trimEnd()}</code>
);

type FrontmatterListProps = {
  localeText: FrontmatterLocaleText;
  propertyKey: string;
  tags: boolean;
  value: FrontmatterScalar[];
};

const FrontmatterList = ({ localeText, propertyKey, tags, value }: FrontmatterListProps) => {
  if (value.length === 0) {
    return <span className={styles.emptyValue}>{localeText.emptyList}</span>;
  }

  return (
    <ul aria-label={localeText.listValues(propertyKey)} className={styles.list}>
      {value.map((entry, index) => (
        <li data-frontmatter-list-item="" key={`${formatScalar(entry)}-${index}`}>
          <Badge color={tags ? 'primary' : 'neutral'}>{formatScalar(entry)}</Badge>
        </li>
      ))}
    </ul>
  );
};

type FrontmatterListEditorProps = FrontmatterListProps & {
  onChange: (value: FrontmatterScalar[]) => void;
  placeholder?: string;
};

const FrontmatterListEditor = ({
  localeText,
  onChange,
  placeholder,
  propertyKey,
  tags,
  value,
}: FrontmatterListEditorProps) => {
  const [draft, setDraft] = useState('');
  const [editDraft, setEditDraft] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const addLabel = localeText.addListItem(propertyKey);
  const canAddItems = tags || value.every((entry) => typeof entry === 'string');
  const beginEditing = (index: number) => {
    setEditDraft(formatScalar(value[index]));
    setEditingIndex(index);
  };
  const cancelEditing = () => {
    setEditDraft('');
    setEditingIndex(null);
  };
  const commitEditedItem = (index: number) => {
    const nextItem = editDraft.trim();
    const currentItem = value[index];

    cancelEditing();

    if (nextItem.length === 0) {
      return;
    }

    const resolvedItem = resolveEditedScalar(currentItem, nextItem);

    if (!resolvedItem.isValid || Object.is(resolvedItem.value, currentItem)) {
      return;
    }

    onChange(value.map((entry, entryIndex) => (entryIndex === index ? resolvedItem.value : entry)));
  };
  const addItem = () => {
    const nextItem = draft.trim();

    setDraft('');
    setIsAdding(false);

    if (nextItem.length === 0) {
      return;
    }

    onChange([...value, nextItem]);
  };
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    addItem();
  };

  return (
    <ul aria-label={localeText.listValues(propertyKey)} className={styles.editableList}>
      {value.map((entry, index) => (
        <li
          className={styles.editableListItem}
          data-frontmatter-list-item=""
          key={`${formatScalar(entry)}-${index}`}
        >
          {editingIndex === index ? (
            <Input
              aria-label={localeText.editListItem(formatScalar(entry), propertyKey)}
              autoFocus
              className={classNames(styles.listEditInput, {
                [styles.listEditInputPrimary]: tags,
              })}
              onBlur={() => commitEditedItem(index)}
              onChange={(event) => setEditDraft(event.currentTarget.value)}
              onFocus={(event) => event.currentTarget.select()}
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  event.preventDefault();
                  cancelEditing();
                  return;
                }

                if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
                  event.preventDefault();
                  commitEditedItem(index);
                }
              }}
              size="sm"
              value={editDraft}
              variant="ghost"
            />
          ) : (
            <Badge className={styles.editableBadge} color={tags ? 'primary' : 'neutral'}>
              <span className={styles.editableBadgeText}>{formatScalar(entry)}</span>
              <button
                aria-label={localeText.editListItem(formatScalar(entry), propertyKey)}
                className={styles.editableBadgeTrigger}
                onClick={() => beginEditing(index)}
                type="button"
              />
              <IconButton
                aria-label={localeText.removeListItem(formatScalar(entry), propertyKey)}
                className={styles.listRemoveButton}
                icon={<span aria-hidden className={styles.listRemoveGlyph} />}
                onClick={() => onChange(value.filter((_, entryIndex) => entryIndex !== index))}
                size="xs"
                type="button"
                variant="ghost"
              />
            </Badge>
          )}
        </li>
      ))}
      {canAddItems && (
        <li className={styles.listAddItem}>
          {isAdding ? (
            <form className={styles.listAddForm} onSubmit={handleSubmit}>
              <Input
                aria-label={addLabel}
                autoFocus
                className={styles.listAddInput}
                onBlur={addItem}
                onChange={(event) => setDraft(event.currentTarget.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Escape') {
                    event.preventDefault();
                    setDraft('');
                    setIsAdding(false);
                  }
                }}
                placeholder={placeholder ?? localeText.addValue}
                size="sm"
                value={draft}
                variant="ghost"
              />
              <IconButton
                aria-label={addLabel}
                className={styles.listAddButton}
                icon={<AddIcon aria-hidden size="1em" />}
                size="xs"
                type="submit"
                variant="ghost"
              />
            </form>
          ) : (
            <IconButton
              aria-label={addLabel}
              className={styles.listAddButton}
              icon={<AddIcon aria-hidden size="1em" />}
              onClick={() => setIsAdding(true)}
              size="xs"
              type="button"
              variant="ghost"
            />
          )}
        </li>
      )}
    </ul>
  );
};

type FrontmatterPropertyTypeControlProps = {
  canChangeType: boolean;
  editable: boolean;
  isTypeAllowed?: (type: FrontmatterPropertyType) => boolean;
  localeText: FrontmatterLocaleText;
  onChange: (type: FrontmatterPropertyType) => void;
  onDelete?: () => void;
  propertyKey: string;
  value: FrontmatterPropertyType;
};

const FrontmatterPropertyTypeControl = ({
  canChangeType,
  editable,
  isTypeAllowed = () => true,
  localeText,
  onChange,
  onDelete,
  propertyKey,
  value,
}: FrontmatterPropertyTypeControlProps) => {
  const icon = renderPropertyTypeIcon(value);

  if (!editable) {
    return (
      <span aria-hidden className={styles.typeIndicator}>
        {icon}
      </span>
    );
  }

  return (
    <Menu
      onSelect={({ value: nextValue }) => {
        if (frontmatterPropertyTypeOptions.includes(nextValue as FrontmatterPropertyType)) {
          onChange(nextValue as FrontmatterPropertyType);
        }
      }}
      placement="bottom-start"
      size="sm"
    >
      <MenuTrigger>
        <IconButton
          aria-label={localeText.changePropertyType(propertyKey)}
          className={styles.typeTrigger}
          icon={icon}
          size="xs"
          type="button"
          variant="ghost"
        />
      </MenuTrigger>
      <MenuContent>
        {frontmatterPropertyTypeOptions.map((type) => (
          <MenuItem
            disabled={!canChangeType || !isTypeAllowed(type)}
            icon={renderPropertyTypeIcon(type)}
            key={type}
            selected={type === value}
            value={type}
          >
            {localeText.propertyType(type)}
          </MenuItem>
        ))}
        {onDelete && (
          <>
            <MenuSeparator />
            <MenuItem
              className={styles.deletePropertyItem}
              icon={<TrashIcon aria-hidden size="1em" />}
              onSelect={onDelete}
              value="delete-property"
            >
              {localeText.deleteProperty}
            </MenuItem>
          </>
        )}
      </MenuContent>
    </Menu>
  );
};

type FrontmatterPropertyNameProps = {
  canRename: boolean;
  existingKeys: readonly string[];
  localeText: FrontmatterLocaleText;
  onRename: (nextKey: string) => void;
  propertyKey: string;
};

const FrontmatterPropertyName = ({
  canRename,
  existingKeys,
  localeText,
  onRename,
  propertyKey,
}: FrontmatterPropertyNameProps) => {
  const [draft, setDraft] = useState(propertyKey);
  const [error, setError] = useState<string>();
  const [isEditing, setIsEditing] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const propertyNameRef = useRef<HTMLSpanElement>(null);
  const renameLabel = localeText.renameProperty(propertyKey);

  useEffect(() => {
    if (!isEditing) {
      setDraft(propertyKey);
    }
  }, [isEditing, propertyKey]);

  useEffect(() => {
    const propertyName = propertyNameRef.current;

    if (!propertyName) {
      setIsTruncated(false);
      return;
    }

    const measureTruncation = () => {
      setIsTruncated(propertyName.scrollWidth > propertyName.clientWidth);
    };

    measureTruncation();

    if (typeof ResizeObserver === 'undefined') {
      return;
    }

    const resizeObserver = new ResizeObserver(measureTruncation);
    resizeObserver.observe(propertyName);

    return () => {
      resizeObserver.disconnect();
    };
  }, [isEditing, propertyKey]);

  const cancelEditing = () => {
    setDraft(propertyKey);
    setError(undefined);
    setIsEditing(false);
  };
  const commitRename = (input: HTMLInputElement) => {
    const nextKey = draft.trim();

    if (nextKey.length === 0) {
      setError(localeText.propertyNameRequired);
      input.focus();
      return;
    }

    if (nextKey !== propertyKey && existingKeys.includes(nextKey)) {
      setError(localeText.duplicateProperty(nextKey));
      input.focus();
      return;
    }

    if (nextKey !== propertyKey) {
      onRename(nextKey);
    }

    setError(undefined);
    setIsEditing(false);
  };

  if (canRename && isEditing) {
    return (
      <span className={styles.propertyNameEditor}>
        <Input
          aria-label={renameLabel}
          autoFocus
          className={styles.propertyNameInput}
          onBlur={(event) => commitRename(event.currentTarget)}
          onChange={(event) => {
            setDraft(event.currentTarget.value);
            setError(undefined);
          }}
          onFocus={(event) => event.currentTarget.select()}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.preventDefault();
              cancelEditing();
              return;
            }

            if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
              event.preventDefault();
              commitRename(event.currentTarget);
            }
          }}
          size="sm"
          value={draft}
          variant="ghost"
        />
        {error && (
          <span className={styles.propertyNameError} role="alert">
            {error}
          </span>
        )}
      </span>
    );
  }

  const propertyNameNode = canRename ? (
    <button
      aria-label={renameLabel}
      className={styles.propertyNameButton}
      onClick={() => setIsEditing(true)}
      type="button"
    >
      <span className={styles.propertyName} ref={propertyNameRef}>
        {propertyKey}
      </span>
    </button>
  ) : (
    <span
      className={styles.propertyName}
      ref={propertyNameRef}
      tabIndex={isTruncated ? 0 : undefined}
    >
      {propertyKey}
    </span>
  );

  return (
    <Tooltip.Root placement="top-start">
      <Tooltip.Trigger>{propertyNameNode}</Tooltip.Trigger>
      {isTruncated && <Tooltip.Content>{propertyKey}</Tooltip.Content>}
    </Tooltip.Root>
  );
};

type FrontmatterAddPropertyProps = {
  canChangeType: boolean;
  existingKeys: readonly string[];
  localeText: FrontmatterLocaleText;
  onAdd: (key: string, propertyType: FrontmatterPropertyType) => void;
};

const FrontmatterAddProperty = ({
  canChangeType,
  existingKeys,
  localeText,
  onAdd,
}: FrontmatterAddPropertyProps) => {
  const [draftKey, setDraftKey] = useState('');
  const [draftType, setDraftType] = useState<FrontmatterPropertyType>('text');
  const [error, setError] = useState<string>();
  const [isAdding, setIsAdding] = useState(false);

  const cancelAdding = () => {
    setDraftKey('');
    setDraftType('text');
    setError(undefined);
    setIsAdding(false);
  };
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const propertyKey = draftKey.trim();
    const input = event.currentTarget.querySelector('input');

    if (propertyKey.length === 0) {
      setError(localeText.propertyNameRequired);
      input?.focus();
      return;
    }

    if (existingKeys.includes(propertyKey)) {
      setError(localeText.duplicateProperty(propertyKey));
      input?.focus();
      return;
    }

    onAdd(propertyKey, draftType);
    cancelAdding();
  };

  if (!isAdding) {
    return (
      <Button
        className={styles.addPropertyButton}
        icon={<AddIcon aria-hidden size="1em" />}
        onClick={() => setIsAdding(true)}
        size="xs"
        type="button"
        variant="ghost"
      >
        {localeText.addProperty}
      </Button>
    );
  }

  return (
    <form className={styles.addPropertyForm} onSubmit={handleSubmit}>
      <span className={styles.addPropertyKey}>
        <FrontmatterPropertyTypeControl
          canChangeType={canChangeType}
          editable={canChangeType}
          localeText={localeText}
          onChange={setDraftType}
          propertyKey={localeText.newProperty}
          value={draftType}
        />
        <Input
          aria-label={localeText.propertyName}
          autoFocus
          className={styles.addPropertyInput}
          onChange={(event) => {
            setDraftKey(event.currentTarget.value);
            setError(undefined);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.preventDefault();
              cancelAdding();
            }
          }}
          placeholder={localeText.propertyName}
          size="sm"
          value={draftKey}
          variant="ghost"
        />
      </span>
      <span className={styles.addPropertyActions}>
        <IconButton
          aria-label={localeText.createProperty}
          color="primary"
          icon={<CheckIcon aria-hidden size="1em" />}
          size="xs"
          type="submit"
          variant="ghost"
        />
        <IconButton
          aria-label={localeText.cancelProperty}
          icon={<XIcon aria-hidden size="1em" />}
          onClick={cancelAdding}
          size="xs"
          type="button"
          variant="ghost"
        />
      </span>
      {error && (
        <span className={styles.addPropertyError} role="alert">
          {error}
        </span>
      )}
    </form>
  );
};

type FrontmatterNumberEditorProps = {
  number?: FrontmatterNumberPropertyOptions;
  onChange: (value: number) => void;
  placeholder?: string;
  propertyKey: string;
  value: number;
};

const FrontmatterNumberEditor = ({
  number,
  onChange,
  placeholder,
  propertyKey,
  value,
}: FrontmatterNumberEditorProps) => {
  const [draft, setDraft] = useState(value.toString());

  useEffect(() => setDraft(value.toString()), [value]);

  const changeDraft = (nextDraft: string, nextValue: number) => {
    setDraft(nextDraft);

    if (Number.isFinite(nextValue)) {
      onChange(nextValue);
    }
  };

  return (
    <NumberInput
      aria-label={propertyKey}
      className={styles.numberValueInput}
      inputMode="decimal"
      max={number?.max}
      min={number?.min}
      onValueChange={({ value: nextDraft, valueAsNumber }) => changeDraft(nextDraft, valueAsNumber)}
      onValueCommit={({ valueAsNumber }) => {
        if (!Number.isFinite(valueAsNumber)) {
          setDraft(value.toString());
        }
      }}
      placeholder={placeholder}
      precision={number?.precision}
      showControls={false}
      showFocusRing={false}
      size="sm"
      step={number?.step}
      value={draft}
      variant="ghost"
    />
  );
};

type FrontmatterDateEditorProps = {
  onChange: (value: string) => void;
  placeholder?: string;
  propertyKey: string;
  propertyType: FrontmatterDatePropertyType;
  value: string;
};

const FrontmatterDateEditor = ({
  onChange,
  placeholder,
  propertyKey,
  propertyType,
  value,
}: FrontmatterDateEditorProps) => {
  const parsedValue = parseFrontmatterDateValue(value, propertyType);

  if (propertyType === 'date') {
    return (
      <DatePicker
        aria-label={propertyKey}
        className={styles.dateValueInput}
        clearable
        onValueChange={({ value: nextValue }) =>
          onChange(nextValue ? serializeFrontmatterDateValue(nextValue) : '')
        }
        placeholder={placeholder}
        size="sm"
        value={(parsedValue as DatePickerValue | null) ?? null}
        variant="ghost"
      />
    );
  }

  const granularity: DatePickerTimeGranularity = /:\d{2}:\d{2}$/.test(value) ? 'second' : 'minute';

  return (
    <DatePicker
      aria-label={propertyKey}
      className={styles.dateValueInput}
      clearable
      onValueChange={({ value: nextValue }: { value: DatePickerDateTimeValue | null }) =>
        onChange(nextValue ? serializeFrontmatterDateTimeValue(nextValue, granularity) : '')
      }
      placeholder={placeholder}
      showTime={{ granularity }}
      size="sm"
      value={(parsedValue as DatePickerDateTimeValue | null) ?? null}
      variant="ghost"
    />
  );
};

export const Frontmatter = ({
  className,
  editable = false,
  error,
  label,
  localeText,
  mode,
  onChange,
  onModeChange,
  onPropertyTypeChange,
  onSourceChange,
  propertyOptions,
  propertyTypes,
  renderValue,
  showSourceToggle = false,
  source,
  style,
  value,
}: FrontmatterProps) => {
  const text = useFrontmatterLocaleText(localeText);
  const [internalMode, setInternalMode] = useState<FrontmatterMode>(
    error ? 'source' : 'properties',
  );
  const frontmatter = value ?? {};
  const propertyKeys = Object.keys(frontmatter);
  const resolvedLabel = label ?? text.properties;
  const resolvedMode = error ? 'source' : (mode ?? internalMode);
  const canEditValues = editable && onChange !== undefined;
  const canEditSource = editable && onSourceChange !== undefined;
  const changeMode = (nextMode: FrontmatterMode) => {
    if (mode === undefined) {
      setInternalMode(nextMode);
    }

    onModeChange?.(nextMode);
  };
  const addProperty = (key: string, propertyType: FrontmatterPropertyType) => {
    const propertyValue = createDefaultPropertyValue(propertyType);

    onChange?.({
      action: 'add',
      frontmatter: { ...frontmatter, [key]: propertyValue },
      key,
      path: [key],
      value: propertyValue,
    });
    onPropertyTypeChange?.({ key, type: propertyType });
  };
  const deleteProperty = (key: string, propertyValue: FrontmatterValue) => {
    const nextFrontmatter = Object.fromEntries(
      Object.entries(frontmatter).filter(([entryKey]) => entryKey !== key),
    );

    onChange?.({
      action: 'delete',
      frontmatter: nextFrontmatter,
      key,
      path: [key],
      value: propertyValue,
    });
  };
  const renameProperty = (key: string, nextKey: string, propertyValue: FrontmatterValue) => {
    const nextFrontmatter = Object.fromEntries(
      Object.entries(frontmatter).map(([entryKey, entryValue]) =>
        entryKey === key ? [nextKey, entryValue] : [entryKey, entryValue],
      ),
    );

    onChange?.({
      action: 'rename',
      frontmatter: nextFrontmatter,
      key: nextKey,
      path: [nextKey],
      previousKey: key,
      value: propertyValue,
    });
  };

  return (
    <section
      aria-label={typeof resolvedLabel === 'string' ? resolvedLabel : text.frontmatterProperties}
      className={classNames(styles.root, className)}
      data-editable={editable ? 'true' : undefined}
      data-frontmatter-root="true"
      data-mode={resolvedMode}
      style={style}
    >
      <header className={styles.header}>
        <span className={styles.label}>{resolvedLabel}</span>
        {showSourceToggle && source !== undefined && !error && (
          <Button
            aria-pressed={resolvedMode === 'source'}
            onClick={() => changeMode(resolvedMode === 'source' ? 'properties' : 'source')}
            size="xs"
            type="button"
            variant="ghost"
          >
            {resolvedMode === 'source' ? text.properties : text.source}
          </Button>
        )}
      </header>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      {resolvedMode === 'source' ? (
        <div className={styles.sourceEditor}>
          <code aria-hidden className={styles.fence}>
            ---
          </code>
          {canEditSource ? (
            <Textarea
              aria-label={text.yamlSource}
              className={styles.sourceTextarea}
              onChange={(event) => onSourceChange(event.currentTarget.value)}
              rows={Math.max(3, source?.split(/\r?\n/).length ?? 3)}
              size="sm"
              value={source ?? ''}
            />
          ) : (
            <pre aria-label={text.yamlSource} className={styles.sourcePreview}>
              <code>{source}</code>
            </pre>
          )}
          <code aria-hidden className={styles.fence}>
            ---
          </code>
        </div>
      ) : (
        <>
          {propertyKeys.length === 0 && (
            <p className={styles.emptyProperties}>{text.emptyProperties}</p>
          )}
          <dl className={styles.properties}>
            {Object.entries(frontmatter).map(([key, propertyValue]) => {
              const { propertyType, typeSource } = resolvePropertyType(
                key,
                propertyValue,
                propertyTypes,
              );
              const options = propertyOptions?.[key];
              const path = [key] as const;
              const canEditProperty = canEditValues && options?.editable !== false;
              const canManageProperty = canEditProperty;
              const canChangePropertyType =
                editable && options?.editable !== false && onPropertyTypeChange !== undefined;
              const changeValue = (nextValue: FrontmatterValue) => {
                onChange?.({
                  action: 'set',
                  frontmatter: { ...frontmatter, [key]: nextValue },
                  key,
                  path,
                  value: nextValue,
                });
              };
              const isCompatible = isValueCompatible(propertyValue, propertyType);
              let defaultNode: ReactNode;

              if (!isCompatible) {
                defaultNode = (
                  <span className={styles.mismatch} data-frontmatter-type-mismatch="true">
                    {renderSourceValue(propertyValue)}
                    <span>
                      {propertyType ? text.expectedValue(propertyType) : text.nestedValue}
                    </span>
                  </span>
                );
              } else if (canEditProperty) {
                switch (propertyType) {
                  case 'text':
                    defaultNode = (
                      <Input
                        aria-label={key}
                        className={styles.inlineValueInput}
                        onChange={(event) => changeValue(event.currentTarget.value)}
                        placeholder={options?.placeholder}
                        size="sm"
                        type="text"
                        value={propertyValue as string}
                        variant="ghost"
                      />
                    );
                    break;
                  case 'date':
                  case 'datetime':
                    defaultNode = (
                      <FrontmatterDateEditor
                        onChange={changeValue}
                        placeholder={options?.placeholder}
                        propertyKey={key}
                        propertyType={propertyType}
                        value={propertyValue as string}
                      />
                    );
                    break;
                  case 'number':
                    defaultNode = (
                      <FrontmatterNumberEditor
                        number={options?.number}
                        onChange={changeValue}
                        placeholder={options?.placeholder}
                        propertyKey={key}
                        value={propertyValue as number}
                      />
                    );
                    break;
                  case 'checkbox':
                    defaultNode = (
                      <Checkbox
                        aria-label={key}
                        checked={propertyValue as boolean}
                        className={styles.checkboxEditor}
                        onCheckedChange={changeValue}
                      />
                    );
                    break;
                  case 'list':
                  case 'tags':
                    defaultNode = (
                      <FrontmatterListEditor
                        localeText={text}
                        onChange={changeValue}
                        placeholder={options?.placeholder}
                        propertyKey={key}
                        tags={propertyType === 'tags'}
                        value={propertyValue as FrontmatterScalar[]}
                      />
                    );
                    break;
                }
              } else {
                switch (propertyType) {
                  case 'checkbox':
                    defaultNode = (
                      <span
                        aria-checked={propertyValue as boolean}
                        aria-label={key}
                        className={styles.checkboxValue}
                        role="checkbox"
                      >
                        <CheckboxMark state={propertyValue ? 'checked' : 'unchecked'} />
                      </span>
                    );
                    break;
                  case 'list':
                  case 'tags':
                    defaultNode = (
                      <FrontmatterList
                        localeText={text}
                        propertyKey={key}
                        tags={propertyType === 'tags'}
                        value={propertyValue as FrontmatterScalar[]}
                      />
                    );
                    break;
                  case 'date':
                  case 'datetime':
                    defaultNode = (
                      <time className={styles.textValue} dateTime={propertyValue as string}>
                        {(propertyValue as string).replace('T', ' ')}
                      </time>
                    );
                    break;
                  default:
                    defaultNode = (
                      <span className={propertyValue === '' ? styles.emptyValue : styles.textValue}>
                        {propertyValue === ''
                          ? text.empty
                          : formatScalar(propertyValue as FrontmatterScalar)}
                      </span>
                    );
                }
              }

              const renderedValue = renderValue
                ? renderValue({
                    defaultNode,
                    editable: canEditProperty,
                    key,
                    path,
                    propertyType,
                    typeSource,
                    value: propertyValue,
                    valueType: getValueType(propertyValue),
                  })
                : defaultNode;

              return (
                <div
                  className={styles.property}
                  data-frontmatter-property={key}
                  data-property-type={propertyType}
                  data-type-source={typeSource}
                  key={key}
                >
                  <dt className={styles.propertyKey}>
                    {editable && propertyType && (
                      <FrontmatterPropertyTypeControl
                        canChangeType={canChangePropertyType}
                        editable={canChangePropertyType || canManageProperty}
                        isTypeAllowed={(type) => isValueCompatible(propertyValue, type)}
                        localeText={text}
                        onChange={(type) => onPropertyTypeChange?.({ key, type })}
                        onDelete={
                          canManageProperty ? () => deleteProperty(key, propertyValue) : undefined
                        }
                        propertyKey={key}
                        value={propertyType}
                      />
                    )}
                    <FrontmatterPropertyName
                      canRename={canManageProperty}
                      existingKeys={propertyKeys}
                      localeText={text}
                      onRename={(nextKey) => renameProperty(key, nextKey, propertyValue)}
                      propertyKey={key}
                    />
                  </dt>
                  <dd className={styles.propertyValue}>{renderedValue}</dd>
                </div>
              );
            })}
          </dl>
          {canEditValues && (
            <FrontmatterAddProperty
              canChangeType={onPropertyTypeChange !== undefined}
              existingKeys={propertyKeys}
              localeText={text}
              onAdd={addProperty}
            />
          )}
        </>
      )}
    </section>
  );
};

export type { FrontmatterLocaleText } from './locale/types.ts';
