import { useParams, useHistory } from 'react-router-dom';
import { useToasts } from 'react-toast-notifications';

import { Loader } from '../components';
import styles from '../styles/settings.module.css';
import { useAuth } from '../hooks';
import { useEffect, useState } from 'react';
import { addFriend, fetchUserProfile, removeFriend } from '../api';

const UserProfile = () => {
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);
  const [requestInProgress, setRequestInProgress] = useState(false);
  const { userId } = useParams();
  const { addToast } = useToasts();
  const history = useHistory();
  const auth = useAuth();

  useEffect(() => {
    const getUser = async () => {
      const response = await fetchUserProfile(userId);

      if (response.success) {
        setUser(response.data.user);
      } else {
        addToast(response.message, {
          appearance: 'error',
        });
        return history.push('/');
      }

      setLoading(false);
    };

    getUser();
  }, [userId, history, addToast]);

  if (loading) {
    return <Loader />;
  }

  const checkIfUserIsAFriend = () => {
    const friends = auth.user.friends;
    console.log(friends);
    const friendIds = friends.map((friend) => friend.to_user._id);
    const index = friendIds.indexOf(userId);

    if (index !== -1) {
      return true;
    }

    return false;
  };

  const handleRemoveFriend = async () => {
    setRequestInProgress(true);

    const response = await removeFriend(userId);
    if (response.success) {

      const friendship = auth.user.friends.filter((friend) => friend.to_user._id === userId);

      auth.updateUserFriends(false, friendship[0]);

      addToast("Friend Removed Successfully", {
        appearance: 'success',
      })
    } else {
      addToast(response.message, {
        appearance: 'error',
      })
    }

    setRequestInProgress(false);
  }

  const handleAddFriend = async () => {
    setRequestInProgress(true);

    const response = await addFriend(userId);
    if (response.success) {
      const { friendship } = response.data;

      auth.updateUserFriends(true, friendship);

      addToast("Friend Added Successfully", {
        appearance: 'success',
      })
    } else {
      addToast(response.message, {
        appearance: 'error',
      })
    }

    setRequestInProgress(false);
  }
  return (
    <div className={styles.settings}>
      <div className={styles.imgContainer}>
        <img
          src="https://img.freepik.com/free-vector/businessman-character-avatar-isolated_24877-60111.jpg?w=740&t=st=1679077123~exp=1679077723~hmac=c7abdde721b4e956989700f2ea919f7955cf4f861c226474cb78b9a18051b27c"
          alt=""
        />
      </div>

      <div className={styles.field}>
        <div className={styles.fieldLabel}>Email</div>
        <div className={styles.fieldValue}>{user.email}</div>
      </div>

      <div className={styles.field}>
        <div className={styles.fieldLabel}>Name</div>

        <div className={styles.fieldValue}>{user.name}</div>
      </div>

      <div className={styles.btnGrp}>
        {checkIfUserIsAFriend() ? (
          <button className={`button ${styles.saveBtn}`} onClick={handleRemoveFriend}>{requestInProgress ? "Removing friend..." : "Remove friend"}</button>
        ) : (
          <button className={`button ${styles.saveBtn}`} onClick={handleAddFriend} disabled={requestInProgress}>{requestInProgress ? "Adding friend..." : "Add friend"}</button>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
