import TimePicker from './timepicker'

export default function FilterBar({ filters, setFilters }) {
  const selectClass = `
    bg-white border border-gray-200 text-gray-700 px-3 py-2 rounded-xl text-sm font-medium
    outline-none cursor-pointer hover:border-violet-300 hover:bg-violet-50/30
    transition-all shadow-sm focus:ring-2 focus:ring-violet-100 focus:border-violet-400
  `;
  const iconBtnClass = `
    w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-xl
    text-gray-500 hover:bg-violet-50 hover:text-violet-600 hover:border-violet-300
    shadow-sm transition-colors
  `;
  return (
    <div className="flex items-end justify-between px-6 py-4 border-b border-gray-100 bg-white">

      <div className="flex flex-col gap-2.5">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Filter</span>
        <div className="flex items-center gap-2.5">
          <TimePicker filters={filters} setFilters={setFilters} />

          <select className={selectClass}>
            <option>Semua Topik</option>
            <option>Pilkada</option>
            <option>Ekonomi</option>
          </select>

          <select className={selectClass}>
            <option>SDGs</option>
          </select>

          <select
            className={selectClass}
            value={filters.sentimen}
            onChange={e => setFilters(f => ({ ...f, sentimen: e.target.value }))}
          >
            <option value="$__all">Semua Sentimen</option>
            <option value="positif">Positif</option>
            <option value="netral">Netral</option>
            <option value="negatif">Negatif</option>
          </select>

          <button className="p-2 text-gray-400 hover:text-amber-500 hover:bg-amber-50 rounded-xl transition-colors border border-gray-200 bg-white shadow-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button title="Refresh" className={iconBtnClass}>
          <svg className="w-4 h-4" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
            <path d="M129.9 292.5C143.2 199.5 223.3 128 320 128C373 128 421 149.5 455.8 184.2C456 184.4 456.2 184.6 456.4 184.8L464 192L416.1 192C398.4 192 384.1 206.3 384.1 224C384.1 241.7 398.4 256 416.1 256L544.1 256C561.8 256 576.1 241.7 576.1 224L576.1 96C576.1 78.3 561.8 64 544.1 64C526.4 64 512.1 78.3 512.1 96L512.1 149.4L500.8 138.7C454.5 92.6 390.5 64 320 64C191 64 84.3 159.4 66.6 283.5C64.1 301 76.2 317.2 93.7 319.7C111.2 322.2 127.4 310 129.9 292.6zM573.4 356.5C575.9 339 563.7 322.8 546.3 320.3C528.9 317.8 512.6 330 510.1 347.4C496.8 440.4 416.7 511.9 320 511.9C267 511.9 219 490.4 184.2 455.7C184 455.5 183.8 455.3 183.6 455.1L176 447.9L223.9 447.9C241.6 447.9 255.9 433.6 255.9 415.9C255.9 398.2 241.6 383.9 223.9 383.9L96 384C87.5 384 79.3 387.4 73.3 393.5C67.3 399.6 63.9 407.7 64 416.3L65 543.3C65.1 561 79.6 575.2 97.3 575C115 574.8 129.2 560.4 129 542.7L128.6 491.2L139.3 501.3C185.6 547.4 249.5 576 320 576C449 576 555.7 480.6 573.4 356.5z"/>
          </svg>
        </button>

        <button title="Export" className={iconBtnClass}>
          <svg className="w-4 h-4" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
            <path d="M342.6 73.4C330.1 60.9 309.8 60.9 297.3 73.4L169.3 201.4C156.8 213.9 156.8 234.2 169.3 246.7C181.8 259.2 202.1 259.2 214.6 246.7L288 173.3L288 384C288 401.7 302.3 416 320 416C337.7 416 352 401.7 352 384L352 173.3L425.4 246.7C437.9 259.2 458.2 259.2 470.7 246.7C483.2 234.2 483.2 213.9 470.7 201.4L342.7 73.4zM160 416C160 398.3 145.7 384 128 384C110.3 384 96 398.3 96 416L96 480C96 533 139 576 192 576L448 576C501 576 544 533 544 480L544 416C544 398.3 529.7 384 512 384C494.3 384 480 398.3 480 416L480 480C480 497.7 465.7 512 448 512L192 512C174.3 512 160 497.7 160 480L160 416z"/>
          </svg>
        </button>

        <button title="Share" className={iconBtnClass}>
          <svg className="w-4 h-4" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
            <path d="M448 256C501 256 544 213 544 160C544 107 501 64 448 64C395 64 352 107 352 160C352 165.4 352.5 170.8 353.3 176L223.6 248.1C206.7 233.1 184.4 224 160 224C107 224 64 267 64 320C64 373 107 416 160 416C184.4 416 206.6 406.9 223.6 391.9L353.3 464C352.4 469.2 352 474.5 352 480C352 533 395 576 448 576C501 576 544 533 544 480C544 427 501 384 448 384C423.6 384 401.4 393.1 384.4 408.1L254.7 336C255.6 330.8 256 325.5 256 320C256 314.5 255.5 309.2 254.7 304L384.4 231.9C401.3 246.9 423.6 256 448 256z"/>
          </svg>
        </button>
      </div>
    </div>
  );
}