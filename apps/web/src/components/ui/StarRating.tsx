import { Star } from 'lucide-react';

interface Props {
  rating: number;
  onChange?: (r: number) => void;
  size?: number;
  readonly?: boolean;
}

export function StarRating({ rating, onChange, size = 20, readonly = false }: Props) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform ${
            star <= rating ? 'text-warning' : 'text-base-content/20'
          }`}
          onClick={() => onChange?.(star)}
        >
          <Star size={size} fill={star <= rating ? 'currentColor' : 'none'} />
        </button>
      ))}
    </div>
  );
}
