'use client';

import { useRef } from 'react';
import { extractEmojis } from '@/lib/utils';

interface EmojiButtonProps {
  memo: string;
  onEmojiAdd: (emoji: string) => void;
}

export default function EmojiButton({ memo, onEmojiAdd }: EmojiButtonProps) {
  const emojiInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    emojiInputRef.current?.focus();
  };

  const handleEmojiInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const emojis = extractEmojis(val);
    if (emojis.length === 0) { e.target.value = ''; return; }

    const currentCount = extractEmojis(memo).length;
    const remaining = 2 - currentCount;

    if (remaining <= 0) {
      alert('이모지는 최대 2개까지 입력할 수 있어요.');
      e.target.value = '';
      return;
    }

    const toAdd = emojis.slice(0, remaining).join('');
    onEmojiAdd(toAdd);
    e.target.value = '';
  };

  // 현재 메모의 이모지 미리보기 (있으면 표시, 없으면 기본 아이콘)
  const currentEmojis = extractEmojis(memo);
  const btnLabel = currentEmojis.length > 0
    ? currentEmojis.join('')
    : '🙂';

  return (
    <div className="emoji-btn-wrap">
      {/* 실제 보이는 버튼 */}
      <button
        type="button"
        className="emoji-trigger-btn"
        onMouseDown={e => e.preventDefault()}
        onClick={handleButtonClick}
        aria-label="이모지 추가"
        title={`이모지 (${currentEmojis.length}/2)`}
      >
        {btnLabel}
      </button>

      {/* 기기 이모지 키보드 호출용 숨김 input */}
      <input
        ref={emojiInputRef}
        type="text"
        className="emoji-hidden-input"
        onChange={handleEmojiInput}
        aria-hidden="true"
        tabIndex={-1}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        inputMode="text"
      />
    </div>
  );
}
