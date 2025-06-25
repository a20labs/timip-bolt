import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function TermsOfService() {
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
        <h1>Terms of Service</h1>
        <p className="text-sm text-gray-500 mb-6">Last Updated: June 12, 2025</p>

        <h2>1. Agreement to Terms</h2>
        <p>
          By accessing or using TruIndee Music Platform, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this platform.
        </p>

        <h2>2. Use License</h2>
        <p>
          Permission is granted to temporarily access the materials on TruIndee Music Platform for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
        </p>
        <ul>
          <li>modify or copy the materials;</li>
          <li>use the materials for any commercial purpose or for any public display;</li>
          <li>attempt to reverse engineer any software contained on TruIndee Music Platform;</li>
          <li>remove any copyright or other proprietary notations from the materials; or</li>
          <li>transfer the materials to another person or "mirror" the materials on any other server.</li>
        </ul>

        <h2>3. Subscriptions and Free Trial</h2>
        <p>
          Our platform offers a Starter Plan that serves as a 30-day free trial. After 30 days, your account will automatically convert to a Pro Artist Plan subscription with applicable charges unless you cancel before the trial period ends.
        </p>
        <p>
          When you sign up for a subscription:
        </p>
        <ul>
          <li>Your subscription begins on the date of your purchase and continues for the subscription period you select</li>
          <li>You will be billed in advance for your subscription, either monthly or annually based on your selection</li>
          <li>Your subscription will automatically renew for additional periods equal to your initial subscription period unless you cancel</li>
          <li>You may cancel your subscription at any time through your account settings</li>
        </ul>

        <h2>4. Account Terms</h2>
        <p>
          You are responsible for maintaining the security of your account and password. TruIndee cannot and will not be liable for any loss or damage from your failure to comply with this security obligation.
        </p>

        <h2>5. Content Terms</h2>
        <p>
          You retain ownership of any intellectual property rights that you hold in content you upload to TruIndee. By uploading content, you grant TruIndee a worldwide, royalty-free license to use, reproduce, distribute, and display this content in connection with your use of the platform and TruIndee's services.
        </p>
        <p>
          You represent and warrant that:
        </p>
        <ul>
          <li>You own or control all rights to the content you upload or have received all necessary licenses and permissions</li>
          <li>The content does not infringe or violate the rights of any third parties</li>
          <li>The content complies with these Terms of Service and applicable law</li>
        </ul>

        <h2>6. Payment and Refunds</h2>
        <p>
          All prices are listed in USD. You are responsible for paying all fees and applicable taxes associated with your use of TruIndee. Refunds are available within 14 days of purchase if you are not satisfied with our services.
        </p>

        <h2>7. Limitations</h2>
        <p>
          In no event shall TruIndee or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on TruIndee Music Platform, even if TruIndee or a TruIndee authorized representative has been notified orally or in writing of the possibility of such damage.
        </p>

        <h2>8. Accuracy of Materials</h2>
        <p>
          The materials appearing on TruIndee Music Platform could include technical, typographical, or photographic errors. TruIndee does not warrant that any of the materials on its platform are accurate, complete, or current. TruIndee may make changes to the materials contained on its platform at any time without notice.
        </p>

        <h2>9. Modifications to Terms</h2>
        <p>
          TruIndee may revise these Terms of Service at any time without notice. By using this platform, you agree to be bound by the then-current version of these Terms of Service.
        </p>

        <h2>10. Governing Law</h2>
        <p>
          These Terms shall be governed by and construed in accordance with the laws of the United States and the State of California, without regard to its conflict of law provisions.
        </p>

        <h2>11. Termination</h2>
        <p>
          TruIndee may terminate or suspend your account and bar access to the platform immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever, including without limitation if you breach the Terms.
        </p>

        <h2>12. Contact Information</h2>
        <p>
          If you have any questions about these Terms, please contact us at:
        </p>
        <address>
          Email: legal@truindee.com<br />
          Address: TruIndee Inc., 123 Music Avenue, San Francisco, CA 94107, USA
        </address>
      </div>
    </div>
  );
}

export default TermsOfService;