import { Pencil, Save, Check, Trash2, Search, X } from "lucide-react";

interface Flashcard {
  id: number | null;
  word: string;
  meaning: string;
  example: string;
  image_url: string | null;
  imageFile?: File | null;
  isNew: boolean;
  isDirty: boolean;
  isSaving: boolean;
  isEditing?: boolean;
  original?: {
    word: string;
    meaning: string;
    example: string;
    image_url: string | null;
  };
}

interface FlashcardTabProps {
  flashcards: Flashcard[];
  flashLoading: boolean;
  flashSearchInput: string;
  flashSearch: string;
  addCount: string;
  onSearchChange: (value: string) => void;
  onAddFlashcards: () => void;
  onAddCountChange: (value: string) => void;
  onFlashcardFieldChange: (index: number, field: "word" | "meaning" | "example", value: string) => void;
  onFlashcardImageChange: (index: number, file: File) => void;
  onFlashcardToggleEdit: (index: number) => void;
  onFlashcardCancelEdit: (index: number) => void;
  onFlashcardSave: (index: number) => void;
  onFlashcardDelete: (index: number) => void;
}

const FlashcardTab = ({
  flashcards,
  flashLoading,
  flashSearchInput,
  flashSearch,
  addCount,
  onSearchChange,
  onAddFlashcards,
  onAddCountChange,
  onFlashcardFieldChange,
  onFlashcardImageChange,
  onFlashcardToggleEdit,
  onFlashcardCancelEdit,
  onFlashcardSave,
  onFlashcardDelete,
}: FlashcardTabProps) => {
  const filteredFlashcards = flashcards.filter((fc) =>
    `${fc.word} ${fc.meaning}`.toLowerCase().includes(flashSearch.toLowerCase())
  );

  return (
    <div className="lesson-management__card lesson-management__card--purple">
      <h3 className="lesson-management__section-title lesson-management__section-title--center">
        Danh sách flashcard
      </h3>

      <div className="flashcard-search">
        <span className="flashcard-search__icon">
          <Search size={18} />
        </span>
        <input
          type="text"
          className="flashcard-search__input"
          placeholder="Nhập từ/định nghĩa..."
          value={flashSearchInput}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {flashLoading ? (
        <div className="flashcard-list__empty">Đang tải flashcards...</div>
      ) : filteredFlashcards.length === 0 ? null : (
        <div className="flashcard-list">
          {filteredFlashcards.map((fc, index) => (
            // ...existing code for rendering flashcard items...
            <div key={index} className="flashcard-item">
              {/* ...existing code... */}
            </div>
          ))}
        </div>
      )}

      <div
        className="flashcard-footer"
        style={
          flashcards.length === 0
            ? { flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }
            : { justifyContent: 'flex-end' }
        }
      >
        {flashcards.length === 0 && (
          <div style={{ width: "100%", textAlign: "center", marginBottom: "12px" }}>
            <p style={{ color: "#666", marginBottom: 0 }}>Chưa có flashcard nào.</p>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            type="button"
            className="flashcard-footer__add-button"
            onClick={onAddFlashcards}
          >
            Thêm flashcards
          </button>
          <input
            type="number"
            min={1}
            max={50}
            className="flashcard-footer__count-input"
            value={addCount}
            onChange={(e) => onAddCountChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default FlashcardTab;
