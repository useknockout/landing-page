import Link from "next/link";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

type Variant = "primary" | "secondary" | "dark" | "ghost" | "ghost-dark";
type Size = "sm" | "md" | "lg";

const sizeStyles: Record<Size, string> = {
  sm: "px-3 py-1.5 text-[13px]",
  md: "px-4 py-2.5 text-[14px]",
  lg: "px-[22px] py-3 text-[15px]",
};

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-kno-green text-kno-black hover:bg-kno-green-hover active:bg-kno-green-press active:translate-y-px",
  secondary:
    "bg-kno-white text-kno-black border border-kno-border-gray hover:bg-kno-surface-gray",
  dark:
    "bg-kno-black text-kno-white hover:bg-[#1a1a1a]",
  ghost:
    "bg-transparent text-kno-black hover:bg-kno-surface-gray",
  "ghost-dark":
    "bg-transparent text-kno-white border border-kno-border-dark hover:bg-kno-bg-elev-dark",
};

const baseClass =
  "inline-flex items-center justify-center gap-2 font-semibold rounded-kno-md cursor-pointer transition-all duration-kno-fast ease-kno-out border border-transparent select-none";

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
};

type ButtonAsButton = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type ButtonAsLink = CommonProps & {
  href: string;
  target?: string;
  rel?: string;
};

export type ButtonProps = ButtonAsButton | ButtonAsLink;

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  function Button(props, ref) {
    const { variant = "primary", size = "md", className = "", children } = props;
    const classes = `${baseClass} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`;

    if ("href" in props && props.href !== undefined) {
      const { href, target, rel } = props;
      const external = href.startsWith("http");
      if (external) {
        return (
          <a
            href={href}
            target={target ?? "_blank"}
            rel={rel ?? "noopener noreferrer"}
            className={classes}
            ref={ref as React.Ref<HTMLAnchorElement>}
          >
            {children}
          </a>
        );
      }
      return (
        <Link href={href} className={classes} ref={ref as React.Ref<HTMLAnchorElement>}>
          {children}
        </Link>
      );
    }

    const { variant: _v, size: _s, className: _c, children: _ch, ...rest } =
      props as ButtonAsButton;
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        className={classes}
        {...rest}
      >
        {children}
      </button>
    );
  },
);
