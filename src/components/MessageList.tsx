
import React, { useState } from 'react';
import { Mail, Check, Send } from 'lucide-react';
import { formatRelativeTime } from '@/utils/formatters';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  created_at: string;
  status: 'read' | 'unread';
  job_id: string;
  sender_name?: string;
}

interface MessageListProps {
  messages: Message[];
  onMarkAsRead: (messageId: string) => void;
  userType: 'business' | 'carrier';
  currentUserId?: string;
  refreshMessages?: () => void;
}

const MessageList: React.FC<MessageListProps> = ({ 
  messages, 
  onMarkAsRead, 
  userType, 
  currentUserId,
  refreshMessages 
}) => {
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [isSending, setIsSending] = useState(false);

  if (messages.length === 0) {
    return (
      <div className="text-center py-10">
        <Mail className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-4" />
        <h3 className="text-xl font-medium mb-2">No messages yet</h3>
        <p className="text-muted-foreground">
          {userType === 'carrier' 
            ? "You don't have any messages from businesses yet." 
            : "You haven't sent any messages to carriers yet."}
        </p>
      </div>
    );
  }

  const handleReply = async (message: Message) => {
    if (!replyContent.trim() || !currentUserId) {
      toast.error('Please enter a message');
      return;
    }

    setIsSending(true);

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          job_id: message.job_id,
          sender_id: currentUserId,
          recipient_id: message.sender_id, // Reply to the original sender
          content: replyContent,
          status: 'unread'
        })
        .select();

      if (error) throw error;
      
      toast.success('Reply sent successfully');
      setReplyContent('');
      setReplyingTo(null);
      if (refreshMessages) refreshMessages();
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error('Failed to send reply. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleAcceptJob = async (message: Message) => {
    if (!currentUserId) {
      toast.error('You must be logged in to accept jobs');
      return;
    }

    try {
      // First check if the job is still available
      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .select('status, carrier_id')
        .eq('id', message.job_id)
        .single();

      if (jobError) throw jobError;

      if (jobData.status !== 'available' || jobData.carrier_id) {
        toast.error('This job is no longer available');
        return;
      }

      // Update the job status and assign carrier
      const { error: updateError } = await supabase
        .from('jobs')
        .update({ 
          status: 'assigned',
          carrier_id: currentUserId
        })
        .eq('id', message.job_id);

      if (updateError) throw updateError;

      // Send confirmation message
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          job_id: message.job_id,
          sender_id: currentUserId,
          recipient_id: message.sender_id,
          content: 'I have accepted your job and will begin delivery soon.',
          status: 'unread'
        });

      if (messageError) throw messageError;

      toast.success('Job accepted successfully! Check your active jobs.');

      // Refresh messages to show the confirmation
      if (refreshMessages) refreshMessages();
    } catch (error) {
      console.error('Error accepting job:', error);
      toast.error('Failed to accept job');
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4">
      {messages.map(message => (
        <div 
          key={message.id} 
          className={`p-4 rounded-lg border ${message.status === 'unread' ? 'bg-primary/5 border-primary/20' : 'bg-card border-border'}`}
        >
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-medium flex items-center gap-2">
              {message.sender_name || 'Unknown Sender'}
              {message.status === 'unread' && (
                <span className="h-2 w-2 rounded-full bg-primary"></span>
              )}
            </h3>
            <span className="text-xs text-muted-foreground">
              {formatRelativeTime(new Date(message.created_at))}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-3">{message.content}</p>
          
          <div className="flex flex-wrap gap-2">
            {message.status === 'unread' && userType === 'carrier' && (
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={() => onMarkAsRead(message.id)}
              >
                <Check className="h-3 w-3" />
                <span>Mark as read</span>
              </Button>
            )}
            
            {userType === 'carrier' && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => setReplyingTo(replyingTo === message.id ? null : message.id)}
                >
                  <Send className="h-3 w-3" />
                  <span>{replyingTo === message.id ? 'Cancel' : 'Reply'}</span>
                </Button>
                
                {/* Add job accept button */}
                <Button
                  variant="default"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => handleAcceptJob(message)}
                >
                  <Check className="h-3 w-3" />
                  <span>Accept Job</span>
                </Button>
              </>
            )}
          </div>
          
          {replyingTo === message.id && (
            <div className="mt-3">
              <Textarea
                placeholder="Type your reply..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="min-h-[80px] mb-2"
              />
              <Button
                variant="default"
                size="sm"
                disabled={isSending || !replyContent.trim()}
                onClick={() => handleReply(message)}
                className="flex items-center gap-1"
              >
                <Send className="h-3 w-3" />
                <span>{isSending ? 'Sending...' : 'Send Reply'}</span>
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MessageList;
