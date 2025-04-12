import { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { Review } from '@prisma/client';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

interface ReplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (replyText: string) => Promise<void>;
  review: Review | null;
}

export const ReplyModal = ({ isOpen, onClose, onSubmit, review }: ReplyModalProps) => {
  const { t } = useTranslation('common');
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (review && isOpen) {
      setReplyText(review.reply || '');
    }
  }, [review, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!review) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(replyText);
      onClose();
    } catch (error) {
      console.error('Error submitting reply:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const formatDate = (date: string | Date) => {
    return format(new Date(date), 'MMM d, yyyy');
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {review?.reply ? t('edit-reply') : t('reply-to-review')}
          </DialogTitle>
        </DialogHeader>
        
        {review && (
          <div className="bg-muted/50 p-4 rounded-md mb-4">
            <div className="flex justify-between mb-2">
              <div className="font-medium">{review.author || t('anonymous')}</div>
              <div className="text-sm text-muted-foreground">{formatDate(review.date)}</div>
            </div>
            <div className="flex items-center mb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <span 
                  key={i}
                  className={`text-lg ${i < review.rating ? 'text-yellow-400' : 'text-muted'}`}
                >
                  {'\u2605'}
                </span>
              ))}
            </div>
            <p className="text-muted-foreground text-sm">
              {review.text || t('no-review-text')}
            </p>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="reply" className="block text-sm font-medium mb-1">
              {t('your-reply')}
            </label>
            <Textarea
              id="reply"
              rows={4}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={t('enter-your-reply')}
              className="resize-none"
            />
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              {t('cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? t('submitting') : t('submit')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 