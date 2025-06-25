import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Circle, ArrowRight, ExternalLink } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const complianceSteps = [
  {
    id: 1,
    title: 'ISRC Registration',
    description: 'Register International Standard Recording Codes for your tracks',
    status: 'completed',
    details: 'ISRC codes uniquely identify your recordings worldwide.',
  },
  {
    id: 2,
    title: 'UPC/Barcode Purchase',
    description: 'Obtain Universal Product Codes for your releases',
    status: 'in-progress',
    details: 'UPC codes are required for digital and physical distribution.',
  },
  {
    id: 3,
    title: 'EIN Registration',
    description: 'Register your Employer Identification Number with the IRS',
    status: 'pending',
    details: 'Required for business operations and tax purposes.',
  },
];

export function Compliance() {
  const [currentStep, setCurrentStep] = useState(2);
  const [formData, setFormData] = useState({
    businessName: '',
    contactEmail: '',
    quantity: '10',
  });

  const handleNextStep = () => {
    if (currentStep < complianceSteps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Compliance Wizard</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Complete your music industry compliance requirements
        </p>
      </motion.div>

      {/* Progress Steps */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          {complianceSteps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all
                ${step.status === 'completed'
                  ? 'bg-green-500 border-green-500 text-white'
                  : step.id === currentStep
                  ? 'border-primary-500 text-primary-500'
                  : 'border-gray-300 text-gray-400'
                }
              `}>
                {step.status === 'completed' ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-medium">{step.id}</span>
                )}
              </div>
              {index < complianceSteps.length - 1 && (
                <div className={`
                  w-20 h-0.5 mx-4
                  ${step.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'}
                `} />
              )}
            </div>
          ))}
        </div>

        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {complianceSteps[currentStep - 1]?.title}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {complianceSteps[currentStep - 1]?.details}
          </p>
        </div>
      </Card>

      {/* Current Step Content */}
      <Card className="p-6">
        {currentStep === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                ISRC Registration Complete
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Your ISRC registrant code has been assigned: <strong>USRC17</strong>
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <p className="text-sm text-green-800 dark:text-green-200">
                ✅ You can now assign ISRC codes to your tracks automatically
              </p>
            </div>
          </motion.div>
        )}

        {currentStep === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Purchase UPC Barcodes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Input
                  label="Business Name"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  placeholder="Your business or artist name"
                />
              </div>
              <div>
                <Input
                  label="Contact Email"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  placeholder="your@email.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Quantity Needed
              </label>
              <select
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="1">1 UPC - $30</option>
                <option value="10">10 UPCs - $250</option>
                <option value="100">100 UPCs - $750</option>
                <option value="1000">1,000 UPCs - $2,500</option>
              </select>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                💡 We recommend purchasing 10 UPCs for most independent artists
              </p>
            </div>
          </motion.div>
        )}

        {currentStep === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              EIN Registration
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              An Employer Identification Number (EIN) is required for business operations and tax purposes.
            </p>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                ⚠️ EIN registration must be completed directly with the IRS
              </p>
            </div>
            <Button className="w-full">
              <ExternalLink className="w-4 h-4 mr-2" />
              Continue to IRS Website
            </Button>
          </motion.div>
        )}

        <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            onClick={handlePrevStep}
            disabled={currentStep === 1}
          >
            Previous
          </Button>
          <Button
            onClick={handleNextStep}
            disabled={currentStep === complianceSteps.length}
          >
            Next Step
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </Card>
    </div>
  );
}