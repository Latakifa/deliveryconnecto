
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Send } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface MessageCarrierProps {
  carrierId: string;
  carrierName: string;
  jobId: string;
  businessId: string;
}

const MessageCarrier: React.FC<MessageCarrierProps> = ({ carrierId, carrierName, jobId, businessId }) => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setIsSending(true);

    try {
      // In a real app, this would send a message through your messaging system
      // and potentially trigger a notification to the carrier
      const { error } = await supabase.from('messages').insert({
        job_id: jobId,
        sender_id: businessId,
        recipient_id: carrierId,
        content: message,
        status: 'sent'
      });

      if (error) throw error;

      toast.success(`Message sent to ${carrierName}`);
      setMessage('');
      
      // Simulate sending an SMS notification
      console.log(`SMS would be sent to carrier ${carrierId} with message: ${message}`);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="border border-border rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <MessageSquare className="h-5 w-5 text-primary" />
        <h3 className="font-medium">Message Carrier</h3>
      </div>
      
      <Textarea
        placeholder={`Message to ${carrierName}...`}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="min-h-[100px] mb-3"
      />
      
      <Button 
        className="w-full flex items-center justify-center gap-2" 
        onClick={handleSendMessage}
        disabled={isSending || !message.trim()}
      >
        <Send className="h-4 w-4" />
        <span>{isSending ? 'Sending...' : 'Send Message'}</span>
      </Button>
    </div>
  );
};

export default MessageCarrier;
