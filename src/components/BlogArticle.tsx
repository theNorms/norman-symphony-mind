
import React from 'react';

interface BlogArticleProps {
  title?: string;
  content?: string;
}

const BlogArticle: React.FC<BlogArticleProps> = ({ title, content }) => {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {title ? (
        <h1 className="text-4xl font-bold mb-6">{title}</h1>
      ) : (
        <div className="h-16 bg-muted/20 rounded animate-pulse mb-6"></div>
      )}
      
      {content ? (
        <div className="prose prose-lg max-w-none">
          {content.split('\n').map((paragraph, index) => (
            paragraph ? <p key={index}>{paragraph}</p> : <br key={index} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="h-4 bg-muted/20 rounded w-full animate-pulse"></div>
          <div className="h-4 bg-muted/20 rounded w-11/12 animate-pulse"></div>
          <div className="h-4 bg-muted/20 rounded w-full animate-pulse"></div>
          <div className="h-4 bg-muted/20 rounded w-4/5 animate-pulse"></div>
          <div className="h-4 bg-muted/20 rounded w-full animate-pulse"></div>
        </div>
      )}
    </div>
  );
};

export default BlogArticle;
