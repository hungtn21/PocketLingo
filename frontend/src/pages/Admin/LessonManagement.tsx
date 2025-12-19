import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Pencil, Save, Check, Trash2, Search, ChevronDown, Plus, X, Minus } from "lucide-react";
import api from "../../api";
import AdminHeader from "../../component/AdminDashboard/AdminHeader";
import Sidebar from "../../component/Sidebar/Sidebar";
import ToastMessage from "../../component/ToastMessage";
import ConfirmModal from "../../component/ConfirmModal/ConfirmModal";
import QuizConfigModal from "../../component/LessonManagement/QuizConfigModal";
import EditLessonModal from "../../component/LessonManagement/EditLessonModal";
import LessonInfoTab from "../../component/LessonManagement/LessonInfoTab";
import FlashcardTab from "../../component/LessonManagement/FlashcardTab";
import "./LessonManagement.css";

interface LessonInfo {
  id: number;
  course_id: number;
  course_title: string;
  title: string;
  description: string;
  order_index: number;
  status: string;
}

interface AdminLessonDetailResponse {
  success: boolean;
  data: {
    lesson: LessonInfo;
    flashcards: any[];
    quiz: any | null;
    questions: any[];
  };
}

type QuestionType = "multiple_choice" | "fill_in" | "drag_drop";

interface Answer {
  text?: string; // legacy single answer
  options?: string[];
  pairs?: Array<{ left: string; right: string }>;
  correct_option?: number;
  accepted_answers?: string[]; // for fill_in
}

interface Question {
  id: number | null;
  question_text: string;
  question_type: QuestionType;
  order_index: number;
  answer: Answer;
  isNew: boolean;
  isDirty: boolean;
  isSaving: boolean;
  isEditing?: boolean;
  isTypeMenuOpen?: boolean;
  original?: {
    question_text: string;
    question_type: QuestionType;
    order_index: number;
    answer: Answer;
  };
}

const LessonManagement = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"info" | "flashcards" | "quiz">("info");
  const navigate = useNavigate();

  // Helper function to format time from seconds to "X h Y m Z s"
  const formatTimeDisplay = (totalSeconds: number | null): string => {
    if (!totalSeconds) return "Không giới hạn";
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const parts = [];
    if (hours > 0) parts.push(`${hours} h`);
    if (minutes > 0) parts.push(`${minutes} m`);
    if (seconds > 0) parts.push(`${seconds} s`);
    return parts.length > 0 ? parts.join(" ") : "0 s";
  };

  const [lesson, setLesson] = useState<LessonInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState<boolean>(false);
  const [editForm, setEditForm] = useState<{
    title: string;
    description: string;
    order_index: number | "";
    status: "active" | "inactive";
  } | null>(null);
  const [flashcards, setFlashcards] = useState<
    Array<{
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
    }>
  >([]);
  const [flashLoading, setFlashLoading] = useState<boolean>(false);
  const [flashSearchInput, setFlashSearchInput] = useState<string>("");
  const [flashSearch, setFlashSearch] = useState<string>("");
  const [quizSearchInput, setQuizSearchInput] = useState<string>("");
  const [quizSearch, setQuizSearch] = useState<string>("");
  const [quizTypeFilter, setQuizTypeFilter] = useState<"all" | "multiple_choice" | "fill_in" | "drag_drop">("all");
  const [addCount, setAddCount] = useState<string>("1");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    isDangerous?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  // Quiz state
  const [quiz, setQuiz] = useState<{ id: number; time_limit: number | null; passed_score: number } | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quizLoading, setQuizLoading] = useState<boolean>(false);
  const [isEditQuizModalOpen, setIsEditQuizModalOpen] = useState<boolean>(false);
  const [editQuizForm, setEditQuizForm] = useState<{
    hours: number | "";
    minutes: number | "";
    seconds: number | "";
    passed_score: number | "";
    noTimeLimit: boolean;
  } | null>(null);
  const [addQuestionCount, setAddQuestionCount] = useState<string>("1");
  const [addQuestionType, setAddQuestionType] = useState<QuestionType>("multiple_choice");
  const [isQuestionTypeDropdownOpen, setIsQuestionTypeDropdownOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!lessonId) return;

    const fetchLesson = async () => {
      setLoading(true);
      try {
        const res = await api.get<AdminLessonDetailResponse>(`/admins/lessons/${lessonId}/`);
        if (res.data.success) {
          setLesson(res.data.data.lesson);
        } else {
          setToast({ message: "Không tải được thông tin bài học.", type: "error" });
        }
      } catch (error: any) {
        console.error(error);
        const msg = error?.response?.data?.error || "Đã xảy ra lỗi khi tải thông tin bài học.";
        setToast({ message: msg, type: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [lessonId]);

  // Debounce search term for flashcards
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setFlashSearch(flashSearchInput.trim());
    }, 400);
    return () => window.clearTimeout(timeoutId);
  }, [flashSearchInput]);

  // Debounce search term for questions
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setQuizSearch(quizSearchInput.trim());
    }, 400);
    return () => window.clearTimeout(timeoutId);
  }, [quizSearchInput]);

  // Fetch flashcards when tab active or search changes
  useEffect(() => {
    if (activeTab !== "flashcards" || !lessonId) return;

    const fetchFlashcards = async () => {
      try {
        setFlashLoading(true);
        const params: any = { limit: 200 };
        if (flashSearch) params.search = flashSearch;

        const res = await api.get("/lessons/" + lessonId + "/flashcards/", { params });
        if (res.data?.success && res.data.data?.flashcards) {
          const items = (res.data.data.flashcards as any[]).map((f) => ({
            id: f.id as number,
            word: f.word || "",
            meaning: f.meaning || "",
            example: f.example || "",
            image_url: f.image_url || null,
            isNew: false,
            isDirty: false,
            isSaving: false,
            isEditing: false,
          }));
          setFlashcards(items);
        } else {
          setFlashcards([]);
        }
      } catch (error: any) {
        console.error(error);
        const msg = error?.response?.data?.error || "Không tải được danh sách flashcard.";
        setToast({ message: msg, type: "error" });
      } finally {
        setFlashLoading(false);
      }
    };

    fetchFlashcards();
  }, [activeTab, lessonId, flashSearch]);

  // Fetch quiz when tab active
  useEffect(() => {
    if (activeTab !== "quiz" || !lessonId) return;

    const fetchQuiz = async () => {
      try {
        setQuizLoading(true);
        const res = await api.get(`/admins/lessons/${lessonId}/`);
        if (res.data?.success) {
          const { quiz: quizData, questions: questionsData } = res.data.data;
          if (quizData) {
            setQuiz(quizData);
            const items = (questionsData as any[]).map((q) => ({
              id: q.id as number,
              question_text: q.question_text || "",
              question_type: q.question_type as QuestionType,
              order_index: q.order_index || 0,
              answer: q.answer || {},
              isNew: false,
              isDirty: false,
              isSaving: false,
                isEditing: false,
                isTypeMenuOpen: false,
            }));
            setQuestions(items.sort((a, b) => a.order_index - b.order_index));
          } else {
            setQuiz(null);
            setQuestions([]);
          }
        }
      } catch (error: any) {
        console.error(error);
        const msg = error?.response?.data?.error || "Không tải được thông tin quiz.";
        setToast({ message: msg, type: "error" });
      } finally {
        setQuizLoading(false);
      }
    };

    fetchQuiz();
  }, [activeTab, lessonId]);

  const openEditModal = () => {
    if (!lesson) return;
    setEditForm({
      title: lesson.title,
      description: lesson.description || "",
      order_index: lesson.order_index,
      status: (lesson.status as "active" | "inactive") || "active",
    });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    if (saving) return;
    setIsStatusDropdownOpen(false);
    setIsEditModalOpen(false);
  };

  const handleEditChange = (
    field: "title" | "description" | "order_index" | "status",
    value: string
  ) => {
    if (!editForm) return;
    if (field === "order_index") {
      const parsed = value === "" ? "" : Number(value);
      setEditForm({ ...editForm, order_index: parsed as number | "" });
    } else if (field === "status") {
      setEditForm({ ...editForm, status: value as "active" | "inactive" });
      setIsStatusDropdownOpen(false);
    } else {
      setEditForm({ ...editForm, [field]: value });
    }
  };

  const handleSaveLesson = async () => {
    if (!lesson || !editForm) return;

    if (!editForm.title.trim()) {
      setToast({ message: "Tên bài học không được để trống.", type: "error" });
      return;
    }

    if (editForm.order_index === "" || Number.isNaN(editForm.order_index)) {
      setToast({ message: "Thứ tự bài học phải là số.", type: "error" });
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: "Xác nhận cập nhật",
      message: "Bạn chắc chắn muốn cập nhật thông tin bài học?",
      confirmText: "Cập nhật",
      onConfirm: () => doSaveLesson(),
    });
  };

  const doSaveLesson = async () => {
    if (!lesson || !editForm) return;

    try {
      setSaving(true);
      const payload = {
        title: editForm.title.trim(),
        description: editForm.description,
        order_index: editForm.order_index,
        status: editForm.status,
      };

      const res = await api.put<AdminLessonDetailResponse>(
        `/admins/lessons/${lesson.id}/update/`,
        payload
      );

      if (res.data.success && res.data.data.lesson) {
        setLesson(res.data.data.lesson);
        setToast({ message: "Cập nhật bài học thành công.", type: "success" });
        setIsEditModalOpen(false);
      } else {
        setToast({ message: "Không cập nhật được bài học.", type: "error" });
      }
    } catch (error: any) {
      console.error(error);
      const msg =
        error?.response?.data?.errors?.title ||
        error?.response?.data?.errors?.order_index ||
        error?.response?.data?.errors?.status ||
        error?.response?.data?.error ||
        "Đã xảy ra lỗi khi cập nhật bài học.";
      setToast({ message: msg, type: "error" });
    } finally {
      setSaving(false);
      setConfirmModal({ ...confirmModal, isOpen: false });
    }
  };

  const handleFlashcardFieldChange = (
    index: number,
    field: "word" | "meaning" | "example",
    value: string
  ) => {
    setFlashcards((prev) => {
      const copy = [...prev];
      const item = { ...copy[index] };
      (item as any)[field] = value;
      item.isDirty = true;
      copy[index] = item;
      return copy;
    });
  };

  const handleFlashcardToggleEdit = (index: number) => {
    setFlashcards((prev) => {
      const copy = [...prev];
      const item = { ...copy[index] };
      if (!item.isEditing) {
        item.original = {
          word: item.word,
          meaning: item.meaning,
          example: item.example,
          image_url: item.image_url,
        };
        item.isEditing = true;
      } else {
        item.isEditing = false;
        delete (item as any).original;
      }
      copy[index] = item;
      return copy;
    });
  };

  const handleFlashcardCancelEdit = (index: number) => {
    setFlashcards((prev) => {
      const copy = [...prev];
      const item = { ...copy[index] };

      if (item.original) {
        item.word = item.original.word;
        item.meaning = item.original.meaning;
        item.example = item.original.example;
        item.image_url = item.original.image_url;
        item.imageFile = null;
        delete (item as any).original;
      }

      item.isEditing = false;
      item.isDirty = false;
      copy[index] = item;
      return copy;
    });
  };

  const handleFlashcardImageChange = (index: number, file: File | null) => {
    if (!file) return;
    setFlashcards((prev) => {
      const copy = [...prev];
      const item = { ...copy[index] };
      item.imageFile = file;
      item.image_url = URL.createObjectURL(file);
      item.isDirty = true;
      copy[index] = item;
      return copy;
    });
  };

  const handleFlashcardSave = async (index: number) => {
    if (!lessonId) return;
    const item = flashcards[index];
    if (!item) return;

    if (!item.word.trim() || !item.meaning.trim()) {
      setToast({ message: "Từ vựng và Định nghĩa không được để trống.", type: "error" });
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: "Xác nhận lưu flashcard",
      message: `Bạn chắc chắn muốn ${item.id ? "cập nhật" : "thêm"} flashcard này?`,
      confirmText: "Lưu",
      onConfirm: () => doSaveFlashcard(index),
    });
  };

  const doSaveFlashcard = async (index: number) => {
    if (!lessonId) return;
    const item = flashcards[index];
    if (!item) return;

    try {
      setFlashcards((prev) => {
        const copy = [...prev];
        copy[index] = { ...copy[index], isSaving: true };
        return copy;
      });

      const formData = new FormData();
      formData.append("word", item.word.trim());
      formData.append("meaning", item.meaning.trim());
      formData.append("example", item.example || "");
      if (item.imageFile) {
        formData.append("image", item.imageFile);
      }

      let res;
      if (item.id) {
        // Update existing flashcard
        res = await api.put(`/flashcards/${item.id}/update/`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        // Create new flashcard
        res = await api.post(`/lessons/${lessonId}/flashcards/create/`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      if (res.data?.success && res.data.data) {
        const data = res.data.data;
        setFlashcards((prev) => {
          const copy = [...prev];
          copy[index] = {
            id: data.id as number,
            word: data.word || "",
            meaning: data.meaning || "",
            example: data.example || "",
            image_url: data.image_url || null,
            imageFile: null,
            isNew: false,
            isDirty: false,
            isSaving: false,
            isEditing: false,
          };
          return copy;
        });
        setToast({ message: "Lưu flashcard thành công.", type: "success" });
      } else {
        setToast({ message: "Không lưu được flashcard.", type: "error" });
        setFlashcards((prev) => {
          const copy = [...prev];
          copy[index] = { ...copy[index], isSaving: false };
          return copy;
        });
      }
    } catch (error: any) {
      console.error(error);
      const msg =
        error?.response?.data?.errors?.word ||
        error?.response?.data?.errors?.meaning ||
        error?.response?.data?.error ||
        "Đã xảy ra lỗi khi lưu flashcard.";
      setToast({ message: msg, type: "error" });
      setFlashcards((prev) => {
        const copy = [...prev];
        copy[index] = { ...copy[index], isSaving: false };
        return copy;
      });
    } finally {
      setConfirmModal({ ...confirmModal, isOpen: false });
    }
  };

  const handleFlashcardDelete = async (index: number) => {
    const item = flashcards[index];
    if (!item) return;

    // Nếu là card mới chưa lưu thì chỉ cần xóa khỏi UI
    if (!item.id) {
      setFlashcards((prev) => prev.filter((_, i) => i !== index));
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: "Xác nhận xóa flashcard",
      message: `Bạn chắc chắn muốn xóa flashcard này?\n\n"${item.word}"\n\nHành động này không thể hoàn tác.`,
      confirmText: "Xóa",
      isDangerous: true,
      onConfirm: () => doDeleteFlashcard(index),
    });
  };

  const doDeleteFlashcard = async (index: number) => {
    const item = flashcards[index];
    if (!item) return;

    try {
      const res = await api.delete(`/flashcards/${item.id}/delete/`);
      if (res.data?.success) {
        setFlashcards((prev) => prev.filter((_, i) => i !== index));
        setToast({ message: "Xóa flashcard thành công.", type: "success" });
      } else {
        setToast({ message: "Không xóa được flashcard.", type: "error" });
      }
    } catch (error: any) {
      console.error(error);
      const msg = error?.response?.data?.error || "Đã xảy ra lỗi khi xóa flashcard.";
      setToast({ message: msg, type: "error" });
    } finally {
      setConfirmModal({ ...confirmModal, isOpen: false });
    }
  };

  const handleAddFlashcards = () => {
    let count = parseInt(addCount || "1", 10);
    if (Number.isNaN(count) || count <= 0) count = 1;
    if (count > 50) count = 50;

    setFlashcards((prev) => {
      const next = [...prev];
      for (let i = 0; i < count; i += 1) {
        next.push({
          id: null,
          word: "",
          meaning: "",
          example: "",
          image_url: null,
          imageFile: null,
          isNew: true,
          isDirty: true,
          isSaving: false,
        });
      }
      return next;
    });
  };

  // Quiz handlers
  const openQuizConfigModal = () => {
    if (quiz) {
      // Edit existing quiz
      const hours = quiz.time_limit ? Math.floor(quiz.time_limit / 3600) : "";
      const minutes = quiz.time_limit ? Math.floor((quiz.time_limit % 3600) / 60) : "";
      const seconds = quiz.time_limit ? Math.floor(quiz.time_limit % 60) : "";
      setEditQuizForm({
        hours: hours,
        minutes: minutes,
        seconds: seconds,
        passed_score: quiz.passed_score || "",
        noTimeLimit: quiz.time_limit === null || quiz.time_limit === undefined,
      });
    } else {
      // Create new quiz
      setEditQuizForm({
        hours: "",
        minutes: "",
        seconds: "",
        passed_score: 70,
        noTimeLimit: false,
      });
    }
    setIsEditQuizModalOpen(true);
  };

  const closeEditQuizModal = () => {
    if (saving) return;
    setIsEditQuizModalOpen(false);
  };

  const handleEditQuizChange = (field: "hours" | "minutes" | "seconds" | "passed_score" | "noTimeLimit", value: string | boolean) => {
    if (!editQuizForm) return;
    if (field === "noTimeLimit") {
      setEditQuizForm({ ...editQuizForm, noTimeLimit: value as boolean });
    } else {
      const parsed = value === "" ? "" : Number(value);
      setEditQuizForm({ ...editQuizForm, [field]: parsed as number | "" });
    }
  };

  const handleSaveQuiz = async () => {
    if (!lesson || !editQuizForm) return;

    if (editQuizForm.passed_score === "" || Number.isNaN(editQuizForm.passed_score)) {
      setToast({ message: "Điểm đặt yêu cầu phải là số.", type: "error" });
      return;
    }

    if (!editQuizForm.noTimeLimit) {
      const hours = editQuizForm.hours === "" ? 0 : Number(editQuizForm.hours);
      const minutes = editQuizForm.minutes === "" ? 0 : Number(editQuizForm.minutes);
      const seconds = editQuizForm.seconds === "" ? 0 : Number(editQuizForm.seconds);
      
      if (Number.isNaN(hours) || Number.isNaN(minutes) || Number.isNaN(seconds)) {
        setToast({ message: "Thời gian phải là số.", type: "error" });
        return;
      }
    }

    setConfirmModal({
      isOpen: true,
      title: quiz ? "Xác nhận cập nhật" : "Xác nhận tạo",
      message: quiz ? "Bạn chắc chắn muốn cập nhật cấu hình quiz?" : "Bạn chắc chắn muốn tạo quiz?",
      confirmText: quiz ? "Cập nhật" : "Tạo",
      onConfirm: () => doSaveQuiz(),
    });
  };

  const doSaveQuiz = async () => {
    if (!lesson || !editQuizForm) return;

    try {
      setSaving(true);
      let time_limit = null;
      
      if (!editQuizForm.noTimeLimit) {
        const hours = editQuizForm.hours === "" ? 0 : Number(editQuizForm.hours);
        const minutes = editQuizForm.minutes === "" ? 0 : Number(editQuizForm.minutes);
        const seconds = editQuizForm.seconds === "" ? 0 : Number(editQuizForm.seconds);
        time_limit = hours * 3600 + minutes * 60 + seconds;
      }
      
      const payload = {
        time_limit: time_limit,
        passed_score: Number(editQuizForm.passed_score),
      };

      let res;
      if (quiz) {
        // Update existing quiz
        res = await api.put(`/admins/quizzes/${quiz.id}/update/`, payload);
      } else {
        // Create new quiz
        res = await api.post(`/admins/lessons/${lesson.id}/quizzes/create/`, payload);
      }

      if (res.data?.success && res.data.data) {
        setQuiz(res.data.data);
        // Initialize with 1-2 empty questions if creating new quiz
        if (!quiz) {
          setQuestions([
            {
              id: null,
              question_text: "",
              question_type: "multiple_choice",
              order_index: 1,
              answer: { options: ["", "", "", ""], correct_option: 0 },
              isNew: true,
              isDirty: true,
              isSaving: false,
              isEditing: true,
              isTypeMenuOpen: false,
            },
            {
              id: null,
              question_text: "",
              question_type: "multiple_choice",
              order_index: 2,
              answer: { options: ["", "", "", ""], correct_option: 0 },
              isNew: true,
              isDirty: true,
              isSaving: false,
              isEditing: true,
              isTypeMenuOpen: false,
            },
          ]);
        }
        setToast({ message: quiz ? "Cập nhật quiz thành công." : "Tạo quiz thành công.", type: "success" });
        setIsEditQuizModalOpen(false);
      } else {
        setToast({ message: quiz ? "Không cập nhật được quiz." : "Không tạo được quiz.", type: "error" });
      }
    } catch (error: any) {
      console.error(error);
      const msg = error?.response?.data?.error || (quiz ? "Đã xảy ra lỗi khi cập nhật quiz." : "Đã xảy ra lỗi khi tạo quiz.");
      setToast({ message: msg, type: "error" });
    } finally {
      setSaving(false);
      setConfirmModal({ ...confirmModal, isOpen: false });
    }
  };

  const handleQuestionFieldChange = (index: number, field: "question_text", value: string) => {
    setQuestions((prev) => {
      const copy = [...prev];
      const item = { ...copy[index] };
      (item as any)[field] = value;
      item.isDirty = true;
      copy[index] = item;
      return copy;
    });
  };

  const handleQuestionTypeChange = (index: number, newType: QuestionType) => {
    setQuestions((prev) => {
      const copy = [...prev];
      const item = { ...copy[index] };
      item.question_type = newType;
      // Reset answer based on new type
      if (newType === "multiple_choice") {
        item.answer = { options: ["", "", "", ""], correct_option: 0 };
      } else if (newType === "fill_in") {
        item.answer = { accepted_answers: [""] };
      } else if (newType === "drag_drop") {
        item.answer = { pairs: [{ left: "", right: "" }, { left: "", right: "" }] };
      }
      item.isDirty = true;
      item.isTypeMenuOpen = false;
      copy[index] = item;
      return copy;
    });
  };

  const handleAnswerChange = (
    index: number,
    answerIndex: number | null,
    field: string,
    value: string
  ) => {
    setQuestions((prev) => {
      const copy = [...prev];
      const item = { ...copy[index] };
      const q = item.question_type;

      if (q === "multiple_choice" && Array.isArray(item.answer.options)) {
        const opts = [...item.answer.options];
        if (answerIndex !== null && answerIndex < opts.length) {
          opts[answerIndex] = value;
        }
        item.answer = { ...item.answer, options: opts };
      } else if (q === "fill_in") {
        const current = Array.isArray(item.answer.accepted_answers)
          ? [...item.answer.accepted_answers]
          : [item.answer.text || ""]; // migrate legacy single answer

        if (answerIndex === null) {
          current[0] = value;
        } else {
          const idx = answerIndex;
          if (idx >= current.length) {
            for (let i = current.length; i <= idx; i += 1) {
              current.push("");
            }
          }
          current[idx] = value;
        }

        item.answer = { ...item.answer, accepted_answers: current };
      } else if (q === "drag_drop" && Array.isArray(item.answer.pairs)) {
        const pairs = [...item.answer.pairs];
        if (answerIndex !== null && answerIndex < pairs.length) {
          pairs[answerIndex] = { ...pairs[answerIndex], [field]: value };
        }
        item.answer = { ...item.answer, pairs };
      }

      item.isDirty = true;
      copy[index] = item;
      return copy;
    });
  };

  const handleAddAnswerOption = (index: number) => {
    setQuestions((prev) => {
      const copy = [...prev];
      const item = { ...copy[index] };

      if (item.question_type === "fill_in") {
        const current = Array.isArray(item.answer.accepted_answers)
          ? [...item.answer.accepted_answers]
          : [item.answer.text || ""];
        current.push("");
        item.answer = { ...item.answer, accepted_answers: current };
      } else if (item.question_type === "drag_drop" && Array.isArray(item.answer.pairs)) {
        const pairs = [...item.answer.pairs, { left: "", right: "" }];
        item.answer = { ...item.answer, pairs };
      }

      item.isDirty = true;
      copy[index] = item;
      return copy;
    });
  };

  const handleRemoveAnswerOption = (index: number, answerIndex: number) => {
    setQuestions((prev) => {
      const copy = [...prev];
      const item = { ...copy[index] };

      if (item.question_type === "drag_drop" && Array.isArray(item.answer.pairs)) {
        const pairs = item.answer.pairs.filter((_, i) => i !== answerIndex);
        item.answer = { ...item.answer, pairs };
        item.isDirty = true;
        copy[index] = item;
      } else if (item.question_type === "fill_in") {
        const current = Array.isArray(item.answer.accepted_answers)
          ? [...item.answer.accepted_answers]
          : [item.answer.text || ""];

        if (current.length > 1) {
          const next = current.filter((_, i) => i !== answerIndex);
          item.answer = { ...item.answer, accepted_answers: next };
          item.isDirty = true;
          copy[index] = item;
        }
      }

      return copy;
    });
  };

  const handleQuestionToggleEdit = (index: number) => {
    setQuestions((prev) => {
      const copy = [...prev];
      const item = { ...copy[index] };
      if (!item.isEditing) {
        item.original = {
          question_text: item.question_text,
          question_type: item.question_type,
          order_index: item.order_index,
          answer: JSON.parse(JSON.stringify(item.answer || {})),
        };
        item.isEditing = true;
      } else {
        item.isEditing = false;
        delete (item as any).original;
      }
      copy[index] = item;
      return copy;
    });
  };

  const handleQuestionCancelEdit = (index: number) => {
    setQuestions((prev) => {
      const copy = [...prev];
      const item = { ...copy[index] };

      if (item.original) {
        item.question_text = item.original.question_text;
        item.question_type = item.original.question_type;
        item.order_index = item.original.order_index;
        item.answer = item.original.answer;
        delete (item as any).original;
      }

      item.isEditing = false;
      item.isDirty = false;
      copy[index] = item;
      return copy;
    });
  };

  const handleQuestionSave = async (index: number) => {
    if (!lesson || !quiz) return;
    const item = questions[index];
    if (!item) return;

    if (!item.question_text.trim()) {
      setToast({ message: "Câu hỏi không được để trống.", type: "error" });
      return;
    }

    // Validate answers
    if (item.question_type === "multiple_choice") {
      if (!Array.isArray(item.answer.options) || item.answer.options.some((opt) => !opt.trim())) {
        setToast({ message: "Tất cả các tùy chọn phải được điền.", type: "error" });
        return;
      }
    } else if (item.question_type === "fill_in") {
      const accepted = Array.isArray(item.answer.accepted_answers)
        ? item.answer.accepted_answers
        : item.answer.text
        ? [item.answer.text]
        : [];
      if (!accepted.length || accepted.every((ans) => !String(ans).trim())) {
        setToast({ message: "Câu trả lời không được để trống.", type: "error" });
        return;
      }
    } else if (item.question_type === "drag_drop") {
      if (
        !Array.isArray(item.answer.pairs) ||
        item.answer.pairs.some((p) => !p.left.trim() || !p.right.trim())
      ) {
        setToast({ message: "Tất cả các cặp kéo thả phải được điền.", type: "error" });
        return;
      }
    }

    setConfirmModal({
      isOpen: true,
      title: "Xác nhận lưu câu hỏi",
      message: `Bạn chắc chắn muốn ${item.id ? "cập nhật" : "thêm"} câu hỏi này?`,
      confirmText: "Lưu",
      onConfirm: () => doSaveQuestion(index),
    });
  };

  const doSaveQuestion = async (index: number) => {
    if (!quiz || !lesson) return;
    const item = questions[index];
    if (!item) return;

    try {
      setQuestions((prev) => {
        const copy = [...prev];
        copy[index] = { ...copy[index], isSaving: true };
        return copy;
      });

      let answerPayload: Answer = item.answer;

      if (item.question_type === "fill_in") {
        const accepted = Array.isArray(item.answer.accepted_answers)
          ? item.answer.accepted_answers
          : item.answer.text
          ? [item.answer.text]
          : [];
        answerPayload = { accepted_answers: accepted };
      }

      const payload = {
        quiz: quiz.id,
        question_text: item.question_text.trim(),
        question_type: item.question_type,
        order_index: item.order_index,
        answer: answerPayload,
      };

      let res;
      if (item.id) {
        res = await api.put(`/admins/questions/${item.id}/update/`, payload);
      } else {
        res = await api.post(`/admins/quizzes/${quiz.id}/questions/create/`, payload);
      }

      if (res.data?.success && res.data.data) {
        const data = res.data.data;
        setQuestions((prev) => {
          const copy = [...prev];
          copy[index] = {
            id: data.id as number,
            question_text: data.question_text || "",
            question_type: data.question_type as QuestionType,
            order_index: data.order_index || 0,
            answer: data.answer || {},
            isNew: false,
            isDirty: false,
            isSaving: false,
            isEditing: false,
            isTypeMenuOpen: false,
          };
          return copy;
        });
        setToast({ message: "Lưu câu hỏi thành công.", type: "success" });
      } else {
        setToast({ message: "Không lưu được câu hỏi.", type: "error" });
        setQuestions((prev) => {
          const copy = [...prev];
          copy[index] = { ...copy[index], isSaving: false };
          return copy;
        });
      }
    } catch (error: any) {
      console.error(error);
      const msg =
        error?.response?.data?.errors?.question_text ||
        error?.response?.data?.error ||
        "Đã xảy ra lỗi khi lưu câu hỏi.";
      setToast({ message: msg, type: "error" });
      setQuestions((prev) => {
        const copy = [...prev];
        copy[index] = { ...copy[index], isSaving: false };
        return copy;
      });
    } finally {
      setConfirmModal({ ...confirmModal, isOpen: false });
    }
  };

  const handleQuestionDelete = async (index: number) => {
    const item = questions[index];
    if (!item) return;

    if (!item.id) {
      setQuestions((prev) => prev.filter((_, i) => i !== index));
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: "Xác nhận xóa câu hỏi",
      message: "Bạn có chắc chắn muốn xóa câu hỏi này không? Hành động này không thể hoàn tác.",
      confirmText: "Xóa",
      isDangerous: true,
      onConfirm: () => doDeleteQuestion(index),
    });
  };

  const doDeleteQuestion = async (index: number) => {
    const item = questions[index];
    if (!item) return;

    try {
      const res = await api.delete(`/admins/questions/${item.id}/delete/`);
      if (res.data?.success) {
        setQuestions((prev) => prev.filter((_, i) => i !== index));
        setToast({ message: "Xóa câu hỏi thành công.", type: "success" });
      } else {
        setToast({ message: "Không xóa được câu hỏi.", type: "error" });
      }
    } catch (error: any) {
      console.error(error);
      const msg = error?.response?.data?.error || "Đã xảy ra lỗi khi xóa câu hỏi.";
      setToast({ message: msg, type: "error" });
    } finally {
      setConfirmModal({ ...confirmModal, isOpen: false });
    }
  };

  const handleAddQuestions = () => {
    let count = parseInt(addQuestionCount || "1", 10);
    if (Number.isNaN(count) || count <= 0) count = 1;
    if (count > 50) count = 50;

    setQuestions((prev) => {
      const next = [...prev];
      const maxOrder = next.length > 0 ? Math.max(...next.map((q) => q.order_index)) : 0;
      for (let i = 0; i < count; i += 1) {
        let answer: Answer = {};
        if (addQuestionType === "multiple_choice") {
          answer = { options: ["", "", "", ""], correct_option: 0 };
        } else if (addQuestionType === "fill_in") {
          answer = { accepted_answers: [""] };
        } else if (addQuestionType === "drag_drop") {
          answer = { pairs: [{ left: "", right: "" }, { left: "", right: "" }] };
        }
        next.push({
          id: null,
          question_text: "",
          question_type: addQuestionType,
          order_index: maxOrder + i + 1,
          answer,
          isNew: true,
          isDirty: true,
          isSaving: false,
          isTypeMenuOpen: false,
        });
      }
      return next;
    });
  };

  const getQuestionTypeLabel = (type: QuestionType): string => {
    switch (type) {
      case "multiple_choice":
        return "Trắc nghiệm";
      case "fill_in":
        return "Điền vào chỗ trống";
      case "drag_drop":
        return "Kéo thả";
      default:
        return "Không xác định";
    }
  };

  const renderQuizTab = () => {
    if (quizLoading) {
      return <div className="lesson-management__card lesson-management__card--purple">Đang tải...</div>;
    }

    if (!quiz) {
      return (
        <div className="lesson-management__card lesson-management__card--purple">
          <div className="quiz-empty-state">
            <p>Chưa có quiz cho bài học này.</p>
            <button
              className="lesson-management__edit-button"
              type="button"
              onClick={openQuizConfigModal}
            >
              <span className="lesson-management__edit-icon">
                <Plus size={18} />
              </span>
              Tạo quiz
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="lesson-management__card lesson-management__card--purple">
        {/* Quiz Configuration */}
        <div className="quiz-config">
          <div className="quiz-config__header">
            <h3 className="lesson-management__section-title">Cấu hình quiz</h3>
            <button
              className="lesson-management__edit-button"
              type="button"
              onClick={openQuizConfigModal}
            >
              <span className="lesson-management__edit-icon">
                <Pencil size={18} />
              </span>
              Chỉnh sửa cấu hình
            </button>
          </div>

          <div className="quiz-config__info">
            <p>
              <span className="quiz-config__label">Giới hạn thời gian:</span>{" "}
              {formatTimeDisplay(quiz.time_limit)}
            </p>
            <p>
              <span className="quiz-config__label">Điểm vượt qua:</span> {quiz.passed_score} điểm
            </p>
          </div>
        </div>

        {/* Questions List */}
        <div className="quiz-questions">
          <h3 className="lesson-management__section-title lesson-management__section-title--center">
            Danh sách câu hỏi
          </h3>

          {/* Filter bar for question type as dropdown */}
          <div className="lesson-management__search-sort-bar">
            <div className="quiz-questions__type-dropdown" style={{ minWidth: 180, position: 'relative' }}>
              <div
                className="lesson-management__select-display lesson-management__input"
                style={{ userSelect: 'none' }}
                onClick={() => setIsStatusDropdownOpen((prev) => !prev)}
              >
                <span>
                  {quizTypeFilter === "all"
                    ? "Tất cả"
                    : quizTypeFilter === "multiple_choice"
                    ? "Trắc nghiệm"
                    : quizTypeFilter === "fill_in"
                    ? "Điền vào chỗ trống"
                    : "Kéo thả"}
                </span>
                <span className="lesson-management__select-arrow">
                  <ChevronDown size={16} />
                </span>
              </div>
              {isStatusDropdownOpen && (
                <div className="lesson-management__select-menu" style={{ zIndex: 20 }}>
                  <button
                    type="button"
                    className={
                      "lesson-management__select-option" +
                      (quizTypeFilter === "all" ? " lesson-management__select-option--active" : "")
                    }
                    onClick={() => {
                      setQuizTypeFilter("all");
                      setIsStatusDropdownOpen(false);
                    }}
                  >
                    Tất cả
                  </button>
                  <button
                    type="button"
                    className={
                      "lesson-management__select-option" +
                      (quizTypeFilter === "multiple_choice" ? " lesson-management__select-option--active" : "")
                    }
                    onClick={() => {
                      setQuizTypeFilter("multiple_choice");
                      setIsStatusDropdownOpen(false);
                    }}
                  >
                    Trắc nghiệm
                  </button>
                  <button
                    type="button"
                    className={
                      "lesson-management__select-option" +
                      (quizTypeFilter === "fill_in" ? " lesson-management__select-option--active" : "")
                    }
                    onClick={() => {
                      setQuizTypeFilter("fill_in");
                      setIsStatusDropdownOpen(false);
                    }}
                  >
                    Điền vào chỗ trống
                  </button>
                  <button
                    type="button"
                    className={
                      "lesson-management__select-option" +
                      (quizTypeFilter === "drag_drop" ? " lesson-management__select-option--active" : "")
                    }
                    onClick={() => {
                      setQuizTypeFilter("drag_drop");
                      setIsStatusDropdownOpen(false);
                    }}
                  >
                    Kéo thả
                  </button>
                </div>
              )}
            </div>
            <div className="lesson-management__search-bar">
              <span className="flashcard-search__icon">
                <Search size={18} />
              </span>
              <input
                type="text"
                className="flashcard-search__input"
                placeholder="Tìm kiếm câu hỏi..."
                value={quizSearchInput}
                onChange={(e) => setQuizSearchInput(e.target.value)}
              />
            </div>
          </div>

          {questions.length === 0 ? (
            <div className="quiz-questions__empty">Chưa có câu hỏi nào.</div>
          ) : (
            <div className="quiz-questions__list">
              {questions
                .filter((q) =>
                  (quizTypeFilter === 'all' || q.question_type === quizTypeFilter) &&
                  q.question_text.toLowerCase().includes(quizSearch.toLowerCase())
                )
                .map((q, index) => (
                <div key={index} className="question-item">
                  <div className="question-item__index">{index + 1}</div>
                  <div className="question-item__card">
                    {/* Question Type Badge - Top Left */}
                    <div className="question-type-badge">
                      {q.isEditing || q.isNew ? (
                        <div className="question-type-dropdown-inline">
                          <div
                            className="question-type-dropdown-wrapper"
                            onClick={() => {
                              setQuestions((prev) => {
                                const copy = [...prev];
                                const item = { ...copy[index] };
                                item.isTypeMenuOpen = !item.isTypeMenuOpen;
                                copy[index] = item;
                                return copy;
                              });
                            }}
                          >
                            <span>{getQuestionTypeLabel(q.question_type)}</span>
                            <span className="question-type-dropdown-arrow">
                              <ChevronDown size={14} />
                            </span>
                          </div>
                          {q.isTypeMenuOpen && (
                            <div className="lesson-management__select-menu question-type-dropdown-menu">
                              <button
                                type="button"
                                className={
                                  "lesson-management__select-option" +
                                  (q.question_type === "multiple_choice"
                                    ? " lesson-management__select-option--active"
                                    : "")
                                }
                                onClick={() => handleQuestionTypeChange(index, "multiple_choice")}
                              >
                                Trắc nghiệm
                              </button>
                              <button
                                type="button"
                                className={
                                  "lesson-management__select-option" +
                                  (q.question_type === "fill_in"
                                    ? " lesson-management__select-option--active"
                                    : "")
                                }
                                onClick={() => handleQuestionTypeChange(index, "fill_in")}
                              >
                                Điền vào chỗ trống
                              </button>
                              <button
                                type="button"
                                className={
                                  "lesson-management__select-option" +
                                  (q.question_type === "drag_drop"
                                    ? " lesson-management__select-option--active"
                                    : "")
                                }
                                onClick={() => handleQuestionTypeChange(index, "drag_drop")}
                              >
                                Kéo thả
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="question-type-label">
                          {getQuestionTypeLabel(q.question_type)}
                        </div>
                      )}
                    </div>

                    <div className="question-item__content">
                      <div className="question-row">
                        <div className="question-field question-field--full">
                          <div className="question-field__label">Câu hỏi</div>
                          <textarea
                            className="question-field__textarea"
                            value={q.question_text}
                            onChange={(e) =>
                              handleQuestionFieldChange(index, "question_text", e.target.value)
                            }
                            disabled={!q.isNew && !q.isEditing}
                            readOnly={!q.isNew && !q.isEditing}
                          />
                        </div>
                      </div>

                      {/* Answers based on type - always visible; read-only when not editing */}
                      <div className="question-answers">
                        {q.question_type === "multiple_choice" && Array.isArray(q.answer.options) && (
                            <div className="answer-section">
                            <div className="answer-section__title">Đáp án</div>
                            <div className="answer-options-grid">
                              {q.answer.options.map((opt, optIdx) => (
                                <label
                                  key={optIdx}
                                  className={
                                    "answer-option-item" +
                                    ((q.answer as any).correct_option === optIdx
                                      ? " answer-option-item--correct"
                                      : "")
                                  }
                                  style={{ cursor: "pointer" }}
                                >
                                  <input
                                    type="radio"
                                    id={`question-${index}-option-${optIdx}`}
                                    name={`question-${index}-correct`}
                                    className="answer-option-radio"
                                    checked={(q.answer as any).correct_option === optIdx}
                                    disabled={!q.isNew && !q.isEditing}
                                    onChange={() => {
                                      if (!q.isNew && !q.isEditing) return;
                                      setQuestions((prev) => {
                                        const copy = [...prev];
                                        const item = { ...copy[index] };
                                        item.answer = { ...item.answer, correct_option: optIdx };
                                        item.isDirty = true;
                                        copy[index] = item;
                                        return copy;
                                      });
                                    }}
                                  />
                                  <input
                                    type="text"
                                    className="answer-option__input"
                                    placeholder={`Đáp án ${optIdx + 1}`}
                                    value={opt}
                                    disabled={!q.isNew && !q.isEditing}
                                    readOnly={!q.isNew && !q.isEditing}
                                    onChange={(e) =>
                                      handleAnswerChange(index, optIdx, "", e.target.value)
                                    }
                                  />
                                </label>
                              ))}
                            </div>
                          </div>
                        )}

                        {q.question_type === "fill_in" && (
                          <div className="answer-section">
                            <div className="answer-section__title">Đáp án</div>
                            {(Array.isArray(q.answer.accepted_answers)
                              ? q.answer.accepted_answers
                              : [q.answer.text || ""]
                            ).map((ans, aIdx, arr) => (
                              <div key={aIdx} className="answer-option">
                                <input
                                  type="text"
                                  className="answer-option__input"
                                  placeholder={`Nhập câu trả lời ${aIdx + 1}`}
                                  value={ans}
                                  disabled={!q.isNew && !q.isEditing}
                                  readOnly={!q.isNew && !q.isEditing}
                                  onChange={(e) =>
                                    handleAnswerChange(index, aIdx, "", e.target.value)
                                  }
                                />
                                {(q.isEditing || q.isNew) && arr.length > 1 && (
                                  <button
                                    type="button"
                                    className="answer-option-remove"
                                    onClick={() => handleRemoveAnswerOption(index, aIdx)}
                                    title="Xóa đáp án"
                                  >
                                    Xóa
                                  </button>
                                )}
                              </div>
                            ))}
                            {(q.isEditing || q.isNew) && (
                              <button
                                type="button"
                                className="answer-add-button-text"
                                onClick={() => handleAddAnswerOption(index)}
                                title="Thêm tùy chọn trả lời khác"
                              >
                                <Plus size={16} />
                                <span>Thêm đáp án</span>
                              </button>
                            )}
                          </div>
                        )}

                        {q.question_type === "drag_drop" && Array.isArray(q.answer.pairs) && (
                          <div className="answer-section">
                            <div className="answer-section__title">Đáp án</div>
                            {q.answer.pairs.map((pair, pIdx) => (
                              <div key={pIdx} className="drag-drop-pair">
                                <input
                                  type="text"
                                  className="drag-drop-pair__input"
                                  placeholder="Từ trái"
                                  value={pair.left}
                                  disabled={!q.isNew && !q.isEditing}
                                  readOnly={!q.isNew && !q.isEditing}
                                  onChange={(e) =>
                                    handleAnswerChange(index, pIdx, "left", e.target.value)
                                  }
                                />
                                <input
                                  type="text"
                                  className="drag-drop-pair__input"
                                  placeholder="Từ phải"
                                  value={pair.right}
                                  disabled={!q.isNew && !q.isEditing}
                                  readOnly={!q.isNew && !q.isEditing}
                                  onChange={(e) =>
                                    handleAnswerChange(index, pIdx, "right", e.target.value)
                                  }
                                />
                                {(q.isEditing || q.isNew) && q.answer.pairs && q.answer.pairs.length > 2 && (
                                  <button
                                    type="button"
                                    className="drag-drop-pair__remove"
                                    onClick={() => handleRemoveAnswerOption(index, pIdx)}
                                    title="Xóa cặp từ"
                                  >
                                    Xóa
                                  </button>
                                )}
                              </div>
                            ))}
                            {(q.isEditing || q.isNew) && (
                              <button
                                type="button"
                                className="answer-add-button-text"
                                onClick={() => handleAddAnswerOption(index)}
                              >
                                <Plus size={16} />
                                <span>Thêm cặp từ</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="question-item__actions">
                      <div className="question-actions-right">
                        {q.isNew ? (
                          <button
                            type="button"
                            className={
                              "question-action question-action--save" +
                              (q.isDirty ? " question-action--save-pending" : "")
                            }
                            onClick={() => handleQuestionSave(index)}
                            disabled={q.isSaving}
                          >
                            {q.isSaving
                              ? "..."
                              : q.isDirty
                              ? (
                                  <Save
                                    size={18}
                                    strokeWidth={2.4}
                                    className="question-icon"
                                  />
                                )
                              : (
                                  <Check
                                    size={18}
                                    strokeWidth={2.4}
                                    className="question-icon"
                                  />
                                )}
                          </button>
                        ) : (
                          <button
                            type="button"
                            className={
                              "question-action question-action--edit" +
                              (q.isEditing ? " question-action--edit-active" : "")
                            }
                            onClick={() => {
                              if (q.isEditing) {
                                handleQuestionSave(index);
                              } else {
                                handleQuestionToggleEdit(index);
                              }
                            }}
                            disabled={q.isSaving}
                          >
                            {q.isSaving ? (
                              "..."
                            ) : q.isEditing ? (
                              <Save
                                size={18}
                                strokeWidth={2.4}
                                className="question-icon"
                              />
                            ) : (
                              <Pencil
                                size={18}
                                strokeWidth={2.4}
                                className="question-icon"
                              />
                            )}
                          </button>
                        )}
                        {!q.isNew && q.isEditing && (
                          <button
                            type="button"
                            className="question-action question-action--cancel"
                            onClick={() => handleQuestionCancelEdit(index)}
                            disabled={q.isSaving}
                          >
                            <X
                              size={16}
                              strokeWidth={2.4}
                              className="question-icon"
                            />
                          </button>
                        )}
                        <button
                          type="button"
                          className="question-action question-action--delete"
                          onClick={() => handleQuestionDelete(index)}
                        >
                          <Trash2
                            size={18}
                            className="question-icon"
                            strokeWidth={2.4}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="quiz-questions__footer">
            <button
              type="button"
              className="quiz-questions__add-button"
              onClick={handleAddQuestions}
            >
              Thêm câu hỏi
            </button>
            <div className="quiz-questions__controls">
              <div className="quiz-questions__type-dropdown">
                <div
                  className="lesson-management__select-display lesson-management__input"
                  onClick={() => setIsQuestionTypeDropdownOpen(!isQuestionTypeDropdownOpen)}
                >
                  <span>
                    {addQuestionType === "multiple_choice"
                      ? "Trắc nghiệm"
                      : addQuestionType === "fill_in"
                      ? "Điền vào chỗ trống"
                      : "Kéo thả"}
                  </span>
                  <span className="lesson-management__select-arrow">
                    <ChevronDown size={16} />
                  </span>
                </div>
                {isQuestionTypeDropdownOpen && (
                  <div className="lesson-management__select-menu">
                    <button
                      type="button"
                      className={
                        "lesson-management__select-option" +
                        (addQuestionType === "multiple_choice"
                          ? " lesson-management__select-option--active"
                          : "")
                      }
                      onClick={() => {
                        setAddQuestionType("multiple_choice");
                        setIsQuestionTypeDropdownOpen(false);
                      }}
                    >
                      Trắc nghiệm
                    </button>
                    <button
                      type="button"
                      className={
                        "lesson-management__select-option" +
                        (addQuestionType === "fill_in"
                          ? " lesson-management__select-option--active"
                          : "")
                      }
                      onClick={() => {
                        setAddQuestionType("fill_in");
                        setIsQuestionTypeDropdownOpen(false);
                      }}
                    >
                      Điền vào chỗ trống
                    </button>
                    <button
                      type="button"
                      className={
                        "lesson-management__select-option" +
                        (addQuestionType === "drag_drop"
                          ? " lesson-management__select-option--active"
                          : "")
                      }
                      onClick={() => {
                        setAddQuestionType("drag_drop");
                        setIsQuestionTypeDropdownOpen(false);
                      }}
                    >
                      Kéo thả
                    </button>
                  </div>
                )}
              </div>
              <input
                type="number"
                min={1}
                max={50}
                className="quiz-questions__count-input"
                value={addQuestionCount}
                onChange={(e) => setAddQuestionCount(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="admin-dashboard-page">
      <AdminHeader onHamburgerClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="lesson-management">
        {/* Back button to AdminCourseDetail */}
        {lesson && (
          <div style={{ marginBottom: 16 }}>
            <button
              className="btn btn-light btn-sm me-3 mb-2"
              onClick={() => navigate(`/admin/courses/${lesson.course_id}`)}
              style={{ fontSize: 16 }}
            >
              <span style={{ fontSize: 18, verticalAlign: 'middle', marginRight: 4 }}>←</span> Quay lại khóa học
            </button>
          </div>
        )}

        {lesson && (
          <div className="lesson-management__header-texts">
            <div className="lesson-management__breadcrumb">
              <span className="lesson-management__breadcrumb-label">Khóa học:</span>{" "}
              <span
                className="lesson-management__breadcrumb-course"
                style={{ color: '#5E3C86', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
                onClick={() => navigate(`/admin/courses/${lesson.course_id}`)}
                title="Quay lại chi tiết khóa học"
              >
                {lesson.course_title}
              </span>
            </div>
            <h2 className="lesson-management__title">{lesson.title}</h2>
          </div>
        )}

        <div className="lesson-management__tabs">
          <button
            type="button"
            className={
              "lesson-management__tab" + (activeTab === "info" ? " lesson-management__tab--active" : "")
            }
            onClick={() => setActiveTab("info")}
          >
            Thông tin bài học
          </button>
          <button
            type="button"
            className={
              "lesson-management__tab" +
              (activeTab === "flashcards" ? " lesson-management__tab--active" : "")
            }
            onClick={() => setActiveTab("flashcards")}
          >
            Quản lý flashcard
          </button>
          <button
            type="button"
            className={
              "lesson-management__tab" + (activeTab === "quiz" ? " lesson-management__tab--active" : "")
            }
            onClick={() => setActiveTab("quiz")}
          >
            Quản lý quiz
          </button>
        </div>

        {activeTab === "info" && (
          <LessonInfoTab
            lesson={lesson}
            loading={loading}
            onEditClick={openEditModal}
          />
        )}
        {activeTab === "flashcards" && (
          <FlashcardTab
            flashcards={flashcards}
            flashLoading={flashLoading}
            flashSearchInput={flashSearchInput}
            flashSearch={flashSearch}
            addCount={addCount}
            onSearchChange={setFlashSearchInput}
            onAddFlashcards={handleAddFlashcards}
            onAddCountChange={setAddCount}
            onFlashcardFieldChange={handleFlashcardFieldChange}
            onFlashcardImageChange={handleFlashcardImageChange}
            onFlashcardToggleEdit={handleFlashcardToggleEdit}
            onFlashcardCancelEdit={handleFlashcardCancelEdit}
            onFlashcardSave={handleFlashcardSave}
            onFlashcardDelete={handleFlashcardDelete}
          />
        )}
        {activeTab === "quiz" && renderQuizTab()}
      </div>

        {isEditQuizModalOpen && editQuizForm && (
          <QuizConfigModal
            isOpen={isEditQuizModalOpen}
            editQuizForm={editQuizForm}
            quiz={quiz}
            saving={saving}
            onClose={closeEditQuizModal}
            onSave={handleSaveQuiz}
            onChange={handleEditQuizChange}
          />
        )}

        {isEditModalOpen && editForm && (
          <EditLessonModal
            isOpen={isEditModalOpen}
            editForm={editForm}
            saving={saving}
            isStatusDropdownOpen={isStatusDropdownOpen}
            onClose={closeEditModal}
            onSave={handleSaveLesson}
            onChange={handleEditChange}
            onStatusDropdownToggle={setIsStatusDropdownOpen}
          />
        )}

      {toast && (
        <ToastMessage
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          duration={4000}
        />
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        isDangerous={confirmModal.isDangerous}
        onConfirm={() => {
          confirmModal.onConfirm();
        }}
        onCancel={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        isLoading={saving || (flashcards.some((f) => f.isSaving) ? true : false)}
      />
    </div>
  );
};

export default LessonManagement;
