import type { EditorActionToolbarLocaleText } from './types.ts';

const localeText = {
  blockToolbar: '편집기 블록 도구 모음',
  bold: '굵게',
  bulletedList: '글머리 기호 목록',
  floatingToolbar: '편집기 플로팅 도구 모음',
  heading: (level) => `제목 ${level}`,
  inlineCode: '인라인 코드',
  insertTable: '표 삽입',
  italic: '기울임꼴',
  link: '링크',
  numberedList: '번호 매기기 목록',
  quote: '인용',
  redo: '다시 실행',
  strikethrough: '취소선',
  toolbar: '편집기 서식 도구 모음',
  undo: '실행 취소',
  unlink: '링크 해제',
} satisfies EditorActionToolbarLocaleText;

export default localeText;
