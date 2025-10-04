// HowWeWork.tsx
import { Link } from "react-router-dom"
import { ArrowRight, Users, MapPin,MessageSquare, Wrench, CheckCircle } from "lucide-react";
import { useEffect } from "react";
import { useI18n } from "@/lib/i18n-context";

export default function HowWeWork() {
  const { t } = useI18n();
  
  return (
        <div className="w-full bg-background">
          {/* Navigation */}
         
    <div className=" bg-[#0d1117] text-white flex flex-col items-center px-6 py-10">
      {/* Title */}
      <h1 className="text-5xl font-extrabold mb-4 text-center">{t('howWeWork')}</h1>
      <p className="text-xl text-gray-400 max-w-2xl text-center mb-12">
        {t('howWeWorkDescription')}
      </p>

      {/* Steps Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl">
        {/* Step 1 */}
        <div className="bg-[#111827] p-6 rounded-2xl shadow-md flex flex-col items-center text-center">
          <div className="bg-blue-900/30 p-6 rounded-full mb-4">
            <MessageSquare className="text-blue-400 w-12 h-12" />
          </div>
          <span className="bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full mb-3">
            {t('step1')}
          </span>
          <h3 className="text-lg font-semibold mb-2">{t('reportIssuesStep')}</h3>
          <p className="text-gray-400 text-sm">
            {t('reportIssuesStepDesc')}
          </p>
        </div>

        {/* Step 2 */}
        <div className="bg-[#111827] p-6 rounded-2xl shadow-md flex flex-col items-center text-center">
          <div className="bg-green-900/30 p-6 rounded-full mb-4">
            <Wrench className="text-green-400 w-12 h-12" />
          </div>
          <span className="bg-green-600 text-white text-xs font-bold px-4 py-1 rounded-full mb-3">
            {t('step2')}
          </span>
          <h3 className="text-lg font-semibold mb-2">{t('weTakeAction')}</h3>
          <p className="text-gray-400 text-sm">
            {t('weTakeActionDesc')}
          </p>
        </div>
        

        {/* Step 3 */}
        <div className="bg-[#111827] p-6 rounded-2xl shadow-md flex flex-col items-center text-center">
          <div className="bg-purple-900/30 p-6 rounded-full mb-4">
            <CheckCircle className="text-purple-400 w-12 h-12" />
          </div>
          <span className="bg-purple-600 text-white text-xs font-bold px-4 py-1 rounded-full mb-3">
            {t('step3')}
          </span>
          <h3 className="text-lg font-semibold mb-2">{t('trackProgressStep')}</h3>
          <p className="text-gray-400 text-sm">
            {t('trackProgressStepDesc')}
          </p>
        </div>
      </div>
    </div>
    </div>
  );
}
