import "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      math: React.HTMLAttributes<MathMLElement> & { display?: "block" | "inline" };
      mrow: React.HTMLAttributes<MathMLElement>;
      mi: React.HTMLAttributes<MathMLElement>;
      mo: React.HTMLAttributes<MathMLElement>;
      mn: React.HTMLAttributes<MathMLElement>;
      mtext: React.HTMLAttributes<MathMLElement>;
      msub: React.HTMLAttributes<MathMLElement>;
      mover: React.HTMLAttributes<MathMLElement>;
      mfrac: React.HTMLAttributes<MathMLElement>;
      mtable: React.HTMLAttributes<MathMLElement>;
      mtr: React.HTMLAttributes<MathMLElement>;
      mtd: React.HTMLAttributes<MathMLElement>;
    }
  }
}
