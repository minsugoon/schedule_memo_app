'use client'

interface PWAInstallModalProps {
  onInstall: () => void
  onClose: () => void
}

const PWAInstallModal = ({ onInstall, onClose }: PWAInstallModalProps) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center pb-8 px-4"
      style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="w-full rounded-2xl p-6 flex flex-col items-center gap-4 shadow-2xl"
        style={{
          maxWidth: 'var(--app-max)',
          background: 'var(--card-bg)',
          color: 'var(--text)',
          border: '0.5px solid var(--border)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <img
          src="/icon-192x192.png"
          alt="앱 아이콘"
          width={64}
          height={64}
          className="rounded-2xl"
        />

        <div className="text-center flex flex-col gap-1">
          <p className="font-semibold text-base" style={{ color: 'var(--text)' }}>
            홈 화면에 추가하기
          </p>
          <p className="text-sm" style={{ color: 'var(--text2)' }}>
            할 일 메모장을 앱처럼 빠르게 실행하세요.
            <br />
            인터넷 없이도 사용할 수 있어요.
          </p>
        </div>

        <div className="w-full flex flex-col gap-2">
          <button
            onClick={onInstall}
            className="w-full py-3 rounded-xl text-sm font-semibold"
            style={{ background: 'var(--btn-bg)', color: 'var(--btn-text)' }}
          >
            설치하기
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl text-sm"
            style={{
              background: 'var(--bg3)',
              color: 'var(--text2)',
              border: '0.5px solid var(--border)',
            }}
          >
            나중에
          </button>
        </div>
      </div>
    </div>
  )
}

export default PWAInstallModal
