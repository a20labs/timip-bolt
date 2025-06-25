import { Link } from 'react-router-dom';

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-900 text-gray-400 py-12">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-semibold text-white mb-4">Platform</h3>
            <ul className="space-y-2">
              <li><Link to="/#features" className="hover:text-primary-400 transition-colors">Features</Link></li>
              <li><Link to="/subscription" className="hover:text-primary-400 transition-colors">Pricing</Link></li>
              <li><Link to="/security" className="hover:text-primary-400 transition-colors">Security</Link></li>
              <li><Link to="/compliance" className="hover:text-primary-400 transition-colors">Compliance</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><Link to="/blog" className="hover:text-primary-400 transition-colors">Blog</Link></li>
              <li><Link to="/documentation" className="hover:text-primary-400 transition-colors">Documentation</Link></li>
              <li><Link to="/tutorials" className="hover:text-primary-400 transition-colors">Tutorials</Link></li>
              <li><Link to="/api" className="hover:text-primary-400 transition-colors">API Reference</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="hover:text-primary-400 transition-colors">About</Link></li>
              <li><Link to="/careers" className="hover:text-primary-400 transition-colors">Careers</Link></li>
              <li><Link to="/contact" className="hover:text-primary-400 transition-colors">Contact</Link></li>
              <li><Link to="/press" className="hover:text-primary-400 transition-colors">Press</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><Link to="/privacy-policy" className="hover:text-primary-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms-of-service" className="hover:text-primary-400 transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy/data-deletion" className="hover:text-primary-400 transition-colors">Data Deletion</Link></li>
              <li><Link to="/cookies" className="hover:text-primary-400 transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <img 
              src="/TruIndee-Horz-Logo.png" 
              alt="TruIndee Logo" 
              className="h-12"
            />
          </div>
          
          <div className="flex flex-col items-center md:items-end">
            <p className="text-sm mb-2">© {currentYear} TruIndee. All rights reserved.</p>
            <p className="text-xs">
              <a href="https://bolt.new/" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-400">
                Built with Bolt.new
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;