import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchReviews } from "../redux/slices/reviewSlice";
import { useModal } from "../hooks/useModal";
import { useTranslation } from "react-i18next";
import ReviewModal from "../components/reviews/ReviewModal";
import ReviewsGrid from "../components/reviews/ReviewsGrid";
import api from "../api/axios";

export default function ReviewsPage() {
  const dispatch = useDispatch();
  const { list: reviews, loading } = useSelector((state) => state.reviews);
  const { isOpen, openModal, closeModal } = useModal();
  const { t } = useTranslation();


  useEffect(() => {
    dispatch(fetchReviews());
  }, [dispatch]);
  const { user } = useSelector((state) => state.auth);

  const handleOpenReviewModal = async () => {
    console.log(user)
    if (!user?.id) {
      return alert("You must be logged in to write a review");
    }

    try {
      const res =await api.get("/auth/me");
      if (res.data.orderCount < 1) {
        return alert("You must complete at least one order before reviewing.");
      }
     
      openModal();
    } catch (err) {
      console.error(err);
      alert("Unable to verify review permissions.");
    }
  };

  return (
    <div className="ms-10 me-10 my-10">
      <h2 className="text-2xl font-bold mb-4">{t("reviews")}</h2>

      <button
        onClick={handleOpenReviewModal}
        className="bg-primary text-white px-5 py-2 rounded-xl shadow mb-8"
      >
        + {t("write_review")}
      </button>

      <ReviewModal isOpen={isOpen} close={closeModal} />

      {loading ? <p>{t("loading")}</p> : <ReviewsGrid reviews={reviews} />}
    </div>
  );
}
