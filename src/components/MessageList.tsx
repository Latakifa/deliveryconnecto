
import React from 'react';
import { Mail, Check } from 'lucide-react';
import { formatRelativeTime } from '@/utils/formatters';
import { Button } from '@/components/ui/button';
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
}

const MessageList: React.FC<MessageListProps> = ({ messages, onMarkAsRead, userType }) => {
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
        </div>
      ))}
    </div>
  );
};

export default MessageList;
