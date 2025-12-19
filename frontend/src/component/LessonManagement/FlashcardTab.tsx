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
      ) : filteredFlashcards.length === 0 ? (
        <div className="flashcard-list__empty" />
      ) : (
        <div className="flashcard-list">
          {filteredFlashcards.map((fc, index) => (
            <div key={index} className="flashcard-item">
              <div className="flashcard-item__index">{index + 1}</div>
              <div className="flashcard-item__card">
                <div className="flashcard-item__thumb-column">
                  <label
                    className="flashcard-thumb"
                    htmlFor={`flashcard-image-${index}`}
                    style={{
                      cursor: fc.isNew || fc.isEditing ? "pointer" : "not-allowed",
                      opacity: fc.isNew || fc.isEditing ? 1 : 0.6,
                    }}
                  >
                    {fc.image_url ? (
                      <img
                        src={fc.image_url}
                        alt="Flashcard"
                        className="flashcard-thumb__img"
                      />
                    ) : (
                      <span className="flashcard-thumb__placeholder">Upload ảnh</span>
                    )}
                  </label>
                  <input
                    id={`flashcard-image-${index}`}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      if (file) onFlashcardImageChange(index, file);
                    }}
                    disabled={!fc.isNew && !fc.isEditing}
                  />
                </div>

                <div className="flashcard-item__content">
                  <div className="flashcard-row">
                    <div className="flashcard-field">
                      <div className="flashcard-field__label">Từ vựng</div>
                      <input
                        className="flashcard-field__input"
                        value={fc.word}
                        onChange={(e) =>
                          onFlashcardFieldChange(index, "word", e.target.value)
                        }
                        disabled={!fc.isNew && !fc.isEditing}
                        readOnly={!fc.isNew && !fc.isEditing}
                      />
                    </div>
                    <div className="flashcard-field">
                      <div className="flashcard-field__label">Định nghĩa</div>
                      <input
                        className="flashcard-field__input"
                        value={fc.meaning}
                        onChange={(e) =>
                          onFlashcardFieldChange(index, "meaning", e.target.value)
                        }
                        disabled={!fc.isNew && !fc.isEditing}
                        readOnly={!fc.isNew && !fc.isEditing}
                      />
                    </div>
                  </div>

                  <div className="flashcard-row">
                    <div className="flashcard-field flashcard-field--full">
                      <div className="flashcard-field__label">Ví dụ</div>
                      <textarea
                        className="flashcard-field__textarea"
                        value={fc.example}
                        onChange={(e) =>
                          onFlashcardFieldChange(index, "example", e.target.value)
                        }
                        disabled={!fc.isNew && !fc.isEditing}
                        readOnly={!fc.isNew && !fc.isEditing}
                      />
                    </div>
                  </div>
                </div>

                <div className="flashcard-item__actions">
                  {fc.isNew ? (
                    <button
                      type="button"
                      className={
                        "flashcard-action flashcard-action--save" +
                        (fc.isDirty ? " flashcard-action--save-pending" : "")
                      }
                      onClick={() => onFlashcardSave(index)}
                      disabled={fc.isSaving}
                    >
                      {fc.isSaving
                        ? "..."
                        : fc.isDirty
                        ? (
                            <Save
                              size={18}
                              strokeWidth={2.4}
                              className="flashcard-icon"
                            />
                          )
                        : (
                            <Check
                              size={18}
                              strokeWidth={2.4}
                              className="flashcard-icon"
                            />
                          )}
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        className={
                          "flashcard-action flashcard-action--edit" +
                          (fc.isEditing ? " flashcard-action--edit-active" : "")
                        }
                        onClick={() => {
                          if (fc.isEditing) {
                            onFlashcardSave(index);
                          } else {
                            onFlashcardToggleEdit(index);
                          }
                        }}
                        disabled={fc.isSaving}
                      >
                        {fc.isSaving ? (
                          "..."
                        ) : fc.isEditing ? (
                          <Save
                            size={18}
                            strokeWidth={2.4}
                            className="flashcard-icon"
                          />
                        ) : (
                          <Pencil
                            size={18}
                            strokeWidth={2.4}
                            className="flashcard-icon"
                          />
                        )}
                      </button>
                      {fc.isEditing && !fc.isNew && (
                        <button
                          type="button"
                          className="flashcard-action flashcard-action--cancel"
                          onClick={() => onFlashcardCancelEdit(index)}
                          disabled={fc.isSaving}
                        >
                          <X
                            size={16}
                            strokeWidth={2.4}
                            className="flashcard-icon"
                          />
                        </button>
                      )}
                    </>
                  )}
                  <button
                    type="button"
                    className="flashcard-action flashcard-action--delete"
                    onClick={() => onFlashcardDelete(index)}
                  >
                    <Trash2
                      size={18}
                      className="flashcard-icon"
                      strokeWidth={2.4}
                    />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

          <div className="flashcard-footer">
            {flashcards.length === 0 ? (
              <div style={{ width: "100%", textAlign: "center", margin: "32px 0 12px 0", display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: "#666", marginBottom: 16 }}>Chưa có flashcard nào.</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center' }}>
                  <button
                    type="button"
                    className="flashcard-footer__add-button"
                    onClick={onAddFlashcards}
                    style={{ minWidth: 160 }}
                  >
                    Thêm flashcard đầu tiên
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    className="flashcard-footer__count-input"
                    value={addCount}
                    onChange={(e) => onAddCountChange(e.target.value)}
                    style={{ width: 56, textAlign: 'center' }}
                  />
                </div>
              </div>
            ) : (
              <>
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
              </>
            )}
          </div>
    </div>
  );
};

export default FlashcardTab;