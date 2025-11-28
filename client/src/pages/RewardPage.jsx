import React, { useState, useEffect } from 'react';
import { Star, Gift } from 'lucide-react';
import { useDispatch, useSelector } from "react-redux";
import { getAllRewards } from '../redux/slices/rewardSlice';

export default function RewardPage() {
  const dispatch = useDispatch();

  const { reward, loading, error } = useSelector((state) => state.reward);

  const [points] = useState(1250); // user points (example)
  const nextReward = 1500;
  const progress = (points / nextReward) * 100;

  useEffect(() => {
    dispatch(getAllRewards());
  }, [dispatch]);

  if (loading) return <p className="text-center mt-10">Loading rewards...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;

  const rewards = reward || []; // <-- because backend returns array directly

  const canRedeem = (required) => points >= required;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Rewards</h1>

        {/* Points Card */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 mb-6 shadow-lg text-white relative overflow-hidden">
          <Star className="w-12 h-12 opacity-20 absolute right-4 top-4" />
          <h2 className="text-4xl font-bold mb-4">{points}</h2>

          <p className="text-sm text-blue-100 mb-1">
            Next reward at {nextReward} points
          </p>

          <div className="bg-blue-400 bg-opacity-30 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-white h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-4">Available Rewards</h2>

        {rewards.length === 0 && (
          <p className="text-center text-gray-500">No rewards found.</p>
        )}

        <div className="space-y-4">
          {rewards.map((item) => {
            const product = item.productId;

            return (
              <div 
                key={item._id}
                className="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  
                  {/* Reward Image / Icon */}
                  {product?.imgURL ? (
                    <img 
                      src={product.imgURL}
                      alt={product.name}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded-xl flex items-center justify-center">
                      <Gift className="text-gray-400" />
                    </div>
                  )}

                  {/* Reward Info */}
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {product?.name || "Reward"}
                    </h3>

                    <p className="text-sm text-gray-500">
                      {item.pointsRequired} points needed
                    </p>
                  </div>
                </div>

                {/* Redeem Button */}
                <button
                  disabled={!canRedeem(item.pointsRequired)}
                  className={`px-5 py-2 rounded-lg font-semibold transition ${
                    canRedeem(item.pointsRequired)
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Redeem
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
