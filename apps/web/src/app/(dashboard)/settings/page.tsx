"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { User, Building2, Plug, BrainCircuit } from "lucide-react";

function SectionCard({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-7 h-7 rounded-lg bg-wimmer-50 flex items-center justify-center">
          <Icon className="w-3.5 h-3.5 text-wimmer-600" />
        </div>
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function FormField({
  label,
  id,
  type = "text",
  defaultValue,
  placeholder,
  disabled,
}: {
  label: string;
  id: string;
  type?: string;
  defaultValue?: string;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-xs font-medium text-slate-700 mb-1.5"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-wimmer-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"
      />
    </div>
  );
}

function PlaceholderIntegration({
  name,
  description,
}: {
  name: string;
  description: string;
}) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50">
      <div>
        <div className="text-xs font-semibold text-slate-800">{name}</div>
        <div className="text-xs text-slate-500 mt-0.5">{description}</div>
      </div>
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-200 text-slate-500 whitespace-nowrap">
        Not connected
      </span>
    </div>
  );
}

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="flex flex-col h-full">
      <Header title="Settings" subtitle="Manage your account and workspace" />
      <div className="flex-1 p-6 overflow-y-auto">
        <form onSubmit={handleSave} className="max-w-2xl space-y-6">

          {/* Profile */}
          <SectionCard icon={User} title="Profile">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Full name"
                id="name"
                defaultValue="Demo User"
                placeholder="Your name"
              />
              <FormField
                label="Email address"
                id="email"
                type="email"
                defaultValue="demo@wimmer.ai"
                placeholder="you@company.com"
              />
            </div>
            <div className="mt-4">
              <FormField
                label="New password"
                id="password"
                type="password"
                placeholder="Leave blank to keep current password"
              />
            </div>
          </SectionCard>

          {/* Organisation */}
          <SectionCard icon={Building2} title="Organisation">
            <div className="space-y-4">
              <FormField
                label="Organisation name"
                id="org-name"
                defaultValue="Wimmer Hospitality GmbH"
                placeholder="Your company name"
              />
              <FormField
                label="Primary market"
                id="market"
                defaultValue="Germany"
                placeholder="e.g. Germany"
              />
            </div>
          </SectionCard>

          {/* Integrations */}
          <SectionCard icon={Plug} title="Integrations">
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Connect your PMS and channel manager to unlock real forecasts and
              recommendations.
            </p>
            <div className="space-y-3">
              <PlaceholderIntegration
                name="Property Management System (PMS)"
                description="Apaleo, Opera Cloud, Mews, Protel and others"
              />
              <PlaceholderIntegration
                name="Channel Manager"
                description="SiteMinder, Cloudbeds, D-EDGE and others"
              />
              <PlaceholderIntegration
                name="Revenue Management System (RMS)"
                description="IDeaS, Duetto, Atomize and others"
              />
            </div>
          </SectionCard>

          {/* LLM Provider */}
          <SectionCard icon={BrainCircuit} title="LLM Provider">
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Wimmer uses a large language model to generate narrative insights
              and recommendations. Configure your provider here.
            </p>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="llm-provider"
                  className="block text-xs font-medium text-slate-700 mb-1.5"
                >
                  Provider
                </label>
                <select
                  id="llm-provider"
                  defaultValue="mock"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-wimmer-500"
                >
                  <option value="mock">Mock (demo mode)</option>
                  <option value="anthropic">Anthropic (Claude)</option>
                  <option value="openai">OpenAI (GPT-4)</option>
                  <option value="azure">Azure OpenAI</option>
                </select>
              </div>
              <FormField
                label="API key"
                id="llm-api-key"
                type="password"
                placeholder="sk-…"
                disabled
              />
              <p className="text-xs text-slate-400">
                API key configuration is disabled in demo mode.
              </p>
            </div>
          </SectionCard>

          {/* Save */}
          <div className="flex items-center gap-3 pb-6">
            <button
              type="submit"
              className="bg-wimmer-600 hover:bg-wimmer-700 text-white font-medium py-2 px-5 rounded-lg text-sm transition-colors"
            >
              Save changes
            </button>
            {saved && (
              <span className="text-xs text-emerald-600 font-medium">
                Changes saved.
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
