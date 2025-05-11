// frontend/components/UserProfile.jsx
import { useState, useEffect } from 'react';
import { getUserAccount, getUserInfo, registerUser, getGymCoinBalance } from '../utils/contractHelpers';

export default function UserProfile({ connected }) {
  const [account, setAccount] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [balance, setBalance] = useState('0');
  const [registrationForm, setRegistrationForm] = useState({
    username: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (connected) {
        try {
          const account = await getUserAccount();
          setAccount(account);
          
          // Get user info
          const [fetchedUsername, fetchedEmail, fetchedIsRegistered] = await getUserInfo(account);
          setUsername(fetchedUsername);
          setEmail(fetchedEmail);
          setIsRegistered(fetchedIsRegistered);
          
          // Get balance
          if (fetchedIsRegistered) {
            const balance = await getGymCoinBalance(account);
            setBalance(balance);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };
    
    fetchUserData();
  }, [connected]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRegistrationForm({
      ...registrationForm,
      [name]: value
    });
  };

  const handleRegistration = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await registerUser(registrationForm.username, registrationForm.email);
      
      // Refresh user data
      const [fetchedUsername, fetchedEmail, fetchedIsRegistered] = await getUserInfo(account);
      setUsername(fetchedUsername);
      setEmail(fetchedEmail);
      setIsRegistered(fetchedIsRegistered);
      
      setRegistrationForm({
        username: '',
        email: ''
      });
    } catch (error) {
      console.error("Registration error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!connected) {
    return (
      <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md mt-10">
        <h2 className="text-xl font-bold mb-4">Please connect your wallet</h2>
        <p>Connect your wallet to view your profile information.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md mt-10">
      <h2 className="text-xl font-bold mb-4">User Profile</h2>
      
      {isRegistered ? (
        <div>
          <div className="mb-4">
            <p><strong>Address:</strong> {`${account.substring(0, 6)}...${account.substring(account.length - 4)}`}</p>
            <p><strong>Username:</strong> {username}</p>
            <p><strong>Email:</strong> {email}</p>
            <p><strong>GC Balance:</strong> {balance} GC</p>
          </div>
        </div>
      ) : (
        <div>
          <p className="mb-4">You are not registered. Please register to use the system.</p>
          
          <form onSubmit={handleRegistration}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={registrationForm.username}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={registrationForm.email}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}