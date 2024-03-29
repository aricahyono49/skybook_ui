import React, { useEffect, useState } from 'react'
import "./index.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {  faShareAlt } from "@fortawesome/free-solid-svg-icons";
import { faCommentAlt, faThumbsUp } from '@fortawesome/free-regular-svg-icons';
import { Card} from 'react-bootstrap';
import CONFIG from '../../../Config';
import DashboardApi from '../../../Api/api-dashboard';
import { Comment } from '../Comment';
import { PostAction } from '../PostAction';
import DOMPurify from 'dompurify';
import { useHistory } from 'react-router-dom';

export const Post = (props) => {

  const [likeStyle, setLikeStyle] = useState("");
  const [totalLike, setTotalLike] = useState(props.data.total_like);
  const [totalComment, setTotalComment] = useState("");
  const [showComment, setShowComment] = useState(false);
  const token = props.token;
  const [showActionComment, setShowActionComment] = useState(false);
  const history = useHistory();

 function handleClickProfile(id) {
   history.push(`/dashboard/profil/${id}`);
 }

 // Main Like  & Unlike
  const handleLikeAndUnlike = async (e, token) => {
    const postId = e.target.id;
    if (likeStyle === "likeStyle") {
      helperUnlike(postId, token);
    } else {
      helperLike(postId, token);
    }
  };

  const helperUnlike = async (postId, token) => {
    const unlike = await DashboardApi.unlike(postId, token);
    if (unlike === "unliked post success") {
      setLikeStyle("");
      helperTotalLike(postId, token);
    }
  }
  const helperLike = async (postId, token) => {
    const like = await DashboardApi.like(postId, token);
    if (like === "like post success") {
      setLikeStyle("likeStyle");
      helperTotalLike(postId, token);
    }
  }

  const helperTotalLike = async (postId, token) =>{
      const total_like = await DashboardApi.totalLike(postId, token);
      setTotalLike(total_like);
  }

  const isLike = () => {
    const post_id = props?.profilData?.like_posts_id;
    if (post_id?.includes(props.data.id)) {
      setLikeStyle("likeStyle");
    }
  };

  const handleComment = async (postId, token) => {
    setShowComment(showComment ? false : true)
    const totalComment = await DashboardApi.totalComment(postId, token);
    setTotalComment(totalComment)
  }

  useEffect(() => {
    isLike();
  }, [props.data.id]);

  const loadTotalLike = (likeTotal) => {
    const like =
      totalLike > 0 || likeStyle !== "likeStyle" ? totalLike : likeTotal;
    if (like > 0) {
      return <div className="total-like-post">{like > 99 ? "99+" : like}</div>;
    } else {
      return <div className="total-like-post"></div>;
    }
  };

  const createMarkup = (html) => {
    return  {
      __html: DOMPurify.sanitize(html)
    }
  }
  const loadTotalComment = (commentTotal) => {
    let comment = totalComment > 0 ? totalComment : commentTotal;
    if (comment > 0) {
      return (
        <div className="total-comment-post">
          {comment > 99 ? "99+" : comment}
        </div>
      );
    } else {
      return <div className="total-comment-post"></div>;
    }
  };

  return (
    <div>
      <Card className="mb-2 pt-2">
        <Card.Header className="card-header-clear-style">
          <img
            src={
              props?.data?.user?.profil_picture?.includes("http")
                ? props?.data?.user?.profil_picture
                : `${CONFIG.BASE_URL_API_IMAGE}/${props?.data?.user?.profil_picture}`
            }
            onClick={() => handleClickProfile(props.data.user?.id)}
            alt="Girl in a jacket"
            className="image-post"
          />
          <div className="card-header-title-post">
            <h1 onClick={() => handleClickProfile(props.data.user?.id)}>
              {props.data.user?.name}
            </h1>
            <h2>{props.data?.created_at}</h2>
          </div>
          {props.data.user?.id === props.profilData?.user_auth_id && (
            <PostAction
              deletePost={() => props.delete()}
              editMode={(id) => props.editMode(id)}
              data={props.data}
            />
          )}
        </Card.Header>
        <Card.Body className="pb-1 pt-0">
          <Card.Text>
            <div
              className="preview"
              dangerouslySetInnerHTML={createMarkup(props.data.caption)}
            ></div>
          </Card.Text>
          <Card.Img
            className="post-main-image"
            src={`${CONFIG.BASE_URL_API_IMAGE}/${props.data.image}`}
            alt="Card image "
            height="300"
          />
        </Card.Body>
        <Card.Footer className="card-footer-clear-style">
          <div className="card-footer-action-icon">
            <FontAwesomeIcon
              onClick={(e) => handleLikeAndUnlike(e, token)}
              id={props.data.id}
              icon={faThumbsUp}
              className={`footer-action-icon ${likeStyle}`}
            />

            {loadTotalLike(props.data.total_like)}

            <FontAwesomeIcon
              onClick={() => handleComment(props.data.id, token)}
              id={props.data.id}
              icon={faCommentAlt}
              className="footer-action-icon"
            />
            {loadTotalComment(props.data.total_comment)}
            <FontAwesomeIcon icon={faShareAlt} className="footer-action-icon" />
          </div>
        </Card.Footer>

        {showComment && (
          <Comment
            handleClickProfile = {(id) => handleClickProfile(id)}
            profilData={props.profilData}
            data={props.data}
            setComment={(comment) => setTotalComment(comment)}
            setActionComment={() =>
              setShowActionComment(showActionComment ? false : true)
            }
            actionComment={showActionComment}
          />
        )}
      </Card>
    </div>
  );
}
