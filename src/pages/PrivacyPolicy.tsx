import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function PrivacyPolicy() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <div className="mb-8">
        <Link to="/">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Button>
        </Link>
      </div>

      <div className="prose dark:prose-invert max-w-none">
        <h1>Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-6">Last Updated: June 12, 2025</p>

        <h2>1. Introduction</h2>
        <p>
          TruIndee Music Platform ("we," "our," or "us") respects your privacy and is committed to protecting your personal data. This privacy policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
        </p>

        <h2>2. Information We Collect</h2>
        <p>We collect several types of information from and about users of our platform, including:</p>
        <ul>
          <li><strong>Personal Data:</strong> Name, email address, phone number, postal address, and other identifiers by which you may be contacted online or offline.</li>
          <li><strong>Profile Data:</strong> Username, password, account preferences, and profile information.</li>
          <li><strong>Music Content:</strong> Tracks, albums, artwork, and other content you upload to our platform.</li>
          <li><strong>Transaction Data:</strong> Details about payments to and from you, and other details of products and services you have purchased from us.</li>
          <li><strong>Technical Data:</strong> Internet protocol (IP) address, browser type and version, time zone setting, browser plug-in types and versions, operating system and platform, and other technology on the devices you use to access our platform.</li>
          <li><strong>Usage Data:</strong> Information about how you use our platform, products, and services.</li>
        </ul>

        <h2>3. How We Use Your Information</h2>
        <p>We use your personal data for the following purposes:</p>
        <ul>
          <li>To provide and maintain our platform</li>
          <li>To manage your account and provide you with customer support</li>
          <li>To process transactions and send related information</li>
          <li>To notify you about changes to our platform</li>
          <li>To allow you to participate in interactive features of our platform</li>
          <li>To improve our platform, products, and services</li>
          <li>To monitor the usage of our platform</li>
          <li>To detect, prevent, and address technical issues</li>
        </ul>

        <h2>4. Disclosure of Your Information</h2>
        <p>We may disclose your personal information to:</p>
        <ul>
          <li>Our subsidiaries and affiliates</li>
          <li>Contractors, service providers, and other third parties we use to support our business</li>
          <li>A buyer or other successor in the event of a merger, divestiture, restructuring, reorganization, dissolution, or other sale or transfer of some or all of our assets</li>
          <li>Third parties to market their products or services to you if you have not opted out of these disclosures</li>
          <li>Fulfill the purpose for which you provide it</li>
          <li>For any other purpose disclosed by us when you provide the information</li>
          <li>With your consent</li>
        </ul>

        <h2>5. Data Security</h2>
        <p>
          We have implemented measures designed to secure your personal information from accidental loss and from unauthorized access, use, alteration, and disclosure. All information you provide to us is stored on our secure servers behind firewalls.
        </p>

        <h2>6. Your Rights</h2>
        <p>Depending on your location, you may have certain rights regarding your personal data, including:</p>
        <ul>
          <li>The right to access and receive a copy of your personal data</li>
          <li>The right to rectify or update your personal data</li>
          <li>The right to erase your personal data</li>
          <li>The right to restrict processing of your personal data</li>
          <li>The right to object to processing of your personal data</li>
          <li>The right to data portability</li>
          <li>The right to withdraw consent</li>
        </ul>

        <h2>7. Data Deletion</h2>
        <p>
          You have the right to request deletion of your personal data. Please visit our{' '}
          <Link to="/privacy/data-deletion" className="text-primary-600 hover:underline">
            Data Deletion Instructions page
          </Link>{' '}
          for more information on how to request deletion of your data.
        </p>

        <h2>8. Children's Privacy</h2>
        <p>
          Our platform is not intended for children under 16 years of age. We do not knowingly collect personal information from children under 16. If you are a parent or guardian and you are aware that your child has provided us with personal information, please contact us.
        </p>

        <h2>9. Changes to Our Privacy Policy</h2>
        <p>
          We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date at the top.
        </p>

        <h2>10. Contact Us</h2>
        <p>If you have any questions about this Privacy Policy, please contact us at:</p>
        <address>
          Email: privacy@truindee.com<br />
          Address: TruIndee Inc., 123 Music Avenue, San Francisco, CA 94107, USA
        </address>
      </div>
    </div>
  );
}

export default PrivacyPolicy;