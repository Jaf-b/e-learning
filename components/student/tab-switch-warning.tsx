"use client";

import React from "react";
import { AlertTriangle, Clock, ShieldAlert } from "lucide-react";

interface TabSwitchWarningProps {
  /** Secondes restantes avant soumission automatique */
  countdown: number;
  /** Nombre total de violations (changements d'onglet) */
  tabSwitchCount: number;
  /** Durée totale du compte à rebours */
  totalSeconds: number;
}

/**
 * Overlay plein écran affiché lorsque l'étudiant quitte l'onglet pendant un examen.
 * Affiche un compte à rebours avant soumission automatique.
 */
export function TabSwitchWarning({
  countdown,
  tabSwitchCount,
  totalSeconds,
}: TabSwitchWarningProps) {
  const progress = (countdown / totalSeconds) * 100;
  const isUrgent = countdown <= 5;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div
        className={`
          relative w-full max-w-md mx-4 rounded-2xl shadow-2xl border-2 p-8 text-center
          ${isUrgent
            ? "bg-red-950 border-red-500 animate-pulse"
            : "bg-gray-950 border-amber-500"
          }
        `}
      >
        {/* Icône */}
        <div
          className={`
            w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center
            ${isUrgent ? "bg-red-500/20" : "bg-amber-500/20"}
          `}
        >
          <ShieldAlert
            className={`w-10 h-10 ${isUrgent ? "text-red-400" : "text-amber-400"}`}
          />
        </div>

        {/* Titre */}
        <h2
          className={`text-xl font-bold mb-2 ${isUrgent ? "text-red-300" : "text-amber-300"}`}
        >
          ⚠️ Changement d&apos;onglet détecté !
        </h2>

        <p className="text-sm text-gray-300 mb-6">
          Vous avez quitté la page de l&apos;examen. Revenez immédiatement sinon vos
          réponses seront soumises automatiquement.
        </p>

        {/* Compte à rebours */}
        <div className="mb-6">
          <div
            className={`
              text-6xl font-bold tabular-nums mb-2
              ${isUrgent ? "text-red-400" : "text-white"}
            `}
          >
            {countdown}
          </div>
          <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
            <Clock className="w-3 h-3" />
            secondes avant soumission automatique
          </p>
        </div>

        {/* Barre de progression */}
        <div className="w-full h-2.5 rounded-full bg-gray-800 overflow-hidden mb-6">
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-linear ${
              isUrgent ? "bg-red-500" : "bg-amber-500"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Compteur de violations */}
        {tabSwitchCount > 0 && (
          <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span>
              Violation{tabSwitchCount > 1 ? "s" : ""} enregistrée{tabSwitchCount > 1 ? "s" : ""} :{" "}
              <span className="font-bold text-amber-400">{tabSwitchCount}</span>
            </span>
          </div>
        )}

        <p className="text-xs text-gray-500 mt-4">
          Revenez sur cet onglet pour annuler le décompte.
        </p>
      </div>
    </div>
  );
}
