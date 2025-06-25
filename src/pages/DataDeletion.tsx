import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function DataDeletion() {
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
        <h1 className="flex items-center gap-3">
          <Trash2 className="text-red-500" />
          User Data Deletion Request
        </h1>

        <p>
          In line with Facebook Platform Policy and global privacy laws, TruIndee offers every user the
          right to erase personal data that TruIndee Music Platform received from Facebook Login.
        </p>

        <h2>How to delete your data (Facebook Login users)</h2>
        <ol>
          <li>Log in to Facebook and open <strong>Settings &amp; Privacy &rarr; Settings &rarr; Apps &amp; Websites</strong>.</li>
          <li>Locate <strong>TruIndee Music Platform</strong> in the list.</li>
          <li>Select <em>Remove</em> → <em>Remove</em> again.</li>
          <li>On the follow-up screen click <strong>"Send Request"</strong> to delete your data.</li>
        </ol>

        <p>
          Facebook will immediately confirm the request and, if you connected through our Data-Deletion Callback,
          we will erase your stored information automatically within 24 hours. You may contact us at
          <a href="mailto:privacy@truindee.com"> privacy@truindee.com</a> with your Facebook user-ID
          for a manual confirmation.
        </p>

        <h2>How to delete your data (direct sign-ups)</h2>
        <ol>
          <li>Sign in to <strong>TruIndee Music Platform</strong>.</li>
          <li>Navigate to <strong>Settings → Privacy</strong>.</li>
          <li>Click <strong>"Delete my account and data"</strong> and follow the prompts.</li>
        </ol>

        <p>
          All personally identifiable data will be purged from our production databases within 24 hours and from
          our encrypted backups within 30 days.
        </p>

        <h2>Need help?</h2>
        <p>Email us at <a href="mailto:privacy@truindee.com">privacy@truindee.com</a> or write to:</p>
        <address>TruIndee Inc., 123 Music Avenue, San Francisco, CA 94107, USA</address>
      </div>
    </div>
  );
}

export default DataDeletion;