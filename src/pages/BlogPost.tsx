import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getPostBySlug, type BlogPostDetail } from "../lib/apiFunctions";
import LoadingSpinner from "../ui/LoadingSpinner";
import useSEO from "../hooks/useSEO";
import Error from "./Error";
import Carousel from "../ui/Carousel";

type PostContentBlock =
  | {
      type: "html";
      id: string;
      html: string;
    }
  | {
      type: "gallery";
      id: string;
      images: Array<{
        id: string;
        src: string;
        srcSet?: string;
        sizes?: string;
        title?: string;
      }>;
    };

const formatDate = (date?: string | null): string => {
  if (!date) return "";
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return "";
  return parsedDate.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

export default function BlogPost() {
  const { slug = "" } = useParams();
  const [post, setPost] = useState<BlogPostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const data = await getPostBySlug(slug);
        if (!isMounted) return;

        if (!data) {
          setNotFound(true);
          return;
        }

        setPost(data);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  useSEO(post?.seo, {
    title: post?.title ?? "Artículo",
    description: "Detalle de artículo del blog de Disorder Underground Shop.",
  });

  const contentBlocks = useMemo<PostContentBlock[]>(() => {
    if (!post?.content || typeof DOMParser === "undefined") {
      return [];
    }

    const doc = new DOMParser().parseFromString(post.content, "text/html");
    const nodes = Array.from(doc.body.childNodes);

    return nodes
      .map((node, index): PostContentBlock | null => {
        if (node.nodeType !== Node.ELEMENT_NODE) {
          const text = node.textContent?.trim();
          if (!text) return null;
          return {
            type: "html",
            id: `post-text-${index}`,
            html: `<p>${text}</p>`,
          };
        }

        const element = node as HTMLElement;
        const isGallery =
          element.tagName.toLowerCase() === "figure" &&
          element.classList.contains("wp-block-gallery");

        if (!isGallery) {
          return {
            type: "html",
            id: `post-html-${index}`,
            html: element.outerHTML,
          };
        }

        const images = Array.from(element.querySelectorAll("img"))
          .map((img, imageIndex) => {
            const src = img.getAttribute("src")?.trim() ?? "";
            if (!src) return null;

            return {
              id: img.getAttribute("data-id") || `post-gallery-${index}-image-${imageIndex}`,
              src,
              srcSet: img.getAttribute("srcset")?.trim() || undefined,
              sizes: img.getAttribute("sizes")?.trim() || undefined,
              title: img.getAttribute("alt")?.trim() || post.title,
            };
          })
          .filter((image): image is NonNullable<typeof image> => Boolean(image));

        if (images.length === 0) {
          return null;
        }

        return {
          type: "gallery",
          id: `post-gallery-${index}`,
          images,
        };
      })
      .filter((block): block is PostContentBlock => Boolean(block));
  }, [post?.content, post?.title]);

  if (loading) return <LoadingSpinner />;
  if (notFound || !post) return <Error />;

  return (
    <div className="page-with-navbar px-6 py-10">
      <article className="mx-auto max-w-4xl">
        <Link
          to="/blogs"
          className="mb-5 inline-block font-semibold text-primary-700 transition-colors hover:text-primary-500 dark:text-primary-200 dark:hover:text-primary-100"
        >
          ← Volver al blog
        </Link>

        <h1 className="text-4xl font-bold text-primary-700 dark:text-primary-100">
          {post.title}
        </h1>

        {post.date ? (
          <p className="mt-3 text-primary-600 dark:text-primary-300">
            {formatDate(post.date)}
          </p>
        ) : null}

        {post.featuredImage?.sourceUrl ? (
          <img
            src={post.featuredImage.sourceUrl}
            alt={post.featuredImage.altText ?? post.title}
            className="mt-6 max-h-130 w-full rounded-xl object-cover"
            loading="eager"
            decoding="async"
          />
        ) : null}

        <div className="mt-8 space-y-6">
          {contentBlocks.map((block) => {
            if (block.type === "gallery") {
              return <Carousel key={block.id} images={block.images} />;
            }

            return (
              <div
                key={block.id}
                className="prose prose-lg max-w-none text-primary-700 dark:prose-invert dark:text-primary-200"
                dangerouslySetInnerHTML={{ __html: block.html }}
              />
            );
          })}
        </div>
      </article>
    </div>
  );
}
