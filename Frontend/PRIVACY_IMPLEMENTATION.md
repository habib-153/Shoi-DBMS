# Privacy Settings Implementation Guide

## ✅ Fully Implemented Privacy Features

### 1. Profile Visibility
**Location:** `/api/users/[id]/route.ts`
- **Public**: Everyone can view profile
- **Connections Only**: Only connected users can view (not yet implemented connection logic)
- **Private**: Only the profile owner can view their own profile

**How it works:**
- When someone tries to view a user's profile, the API checks `privacy_settings.profile_visibility`
- If set to `private` and viewer is not the owner, returns 403 error
- Pass `viewer_id` query param to identify the viewer

**Usage:**
```javascript
fetch(`/api/users/${userId}?viewer_id=${currentUserId}`)
```

---

### 2. Allow Messages
**Location:** `/api/messages/route.ts`
- Controls whether therapists can send direct messages to users

**How it works:**
- When a therapist tries to message a user, checks `privacy_settings.allow_messages`
- If `allow_messages = 0`, blocks the message with 403 error
- Returns: "This user has disabled receiving messages"

**Enforced on:**
- Therapist → User messages only
- User → Therapist messages are always allowed (for paid appointments)

---

### 3. Allow Referrals
**Location:** `/api/referrals/route.ts`
- Controls whether psychologists can refer users to psychiatrists

**How it works:**
- When creating a referral, checks `privacy_settings.allow_referrals` for the user
- If `allow_referrals = 0`, blocks referral creation with 403 error
- Returns: "This user has disabled receiving referrals"

**Impact:**
- Therapists cannot create psychiatric referrals for users who opted out
- Users maintain control over specialist referrals

---

### 4. Shield Mode
**Location:** `/api/sessions/[sessionId]/notes/route.ts`
- Extra privacy layer for sensitive therapy information

**How it works:**
- When fetching session notes, checks `privacy_settings.shield_mode`
- If `shield_mode = 1`, masks `therapist_private_notes` field
- Shows: "[Protected by Shield Mode]" instead of actual notes

**What gets protected:**
- Therapist's private notes (not visible to users anyway, but extra layer)
- Can be extended to mask other sensitive fields

---

### 5. Appointment Reminders
**Location:** `/api/notifications/route.ts`
- Controls appointment notification delivery

**How it works:**
- When creating appointment notifications, checks `privacy_settings.appointment_reminders`
- If `appointment_reminders = 0`, blocks notification with 403 error
- Returns: "User has disabled appointment reminders"

**Applies to:**
- Appointment confirmation notifications
- Appointment reminder notifications
- Appointment update notifications (when `notification_type = 'appointment'`)

---

## Privacy Settings Database Structure

```sql
CREATE TABLE privacy_settings (
  setting_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT UNIQUE NOT NULL,
  profile_visibility ENUM('public', 'private', 'connections_only') DEFAULT 'public',
  allow_messages TINYINT(1) DEFAULT 1,
  allow_referrals TINYINT(1) DEFAULT 1,
  shield_mode TINYINT(1) DEFAULT 0,
  appointment_reminders TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## Testing Privacy Settings

### Test Profile Visibility
1. Set profile to "Private" in `/privacy-settings`
2. Try viewing profile from another account
3. Should see: "This profile is private" (403 error)

### Test Allow Messages
1. Turn OFF "Allow Messages" in `/privacy-settings`
2. Have therapist try to send you a message
3. Should see: "This user has disabled receiving messages" (403 error)

### Test Allow Referrals
1. Turn OFF "Allow Referrals" in `/privacy-settings`
2. Have therapist try to create a referral
3. Should see: "This user has disabled receiving referrals" (403 error)

### Test Shield Mode
1. Turn ON "Shield Mode" in `/privacy-settings`
2. View session notes
3. Private notes should show: "[Protected by Shield Mode]"

### Test Appointment Reminders
1. Turn OFF "Appointment Reminders" in `/privacy-settings`
2. System tries to send appointment notification
3. Notification creation fails silently (403 error)

---

## API Error Responses

All privacy violations return consistent error format:

```json
{
  "error": "Human-readable error message",
  "success": false
}
```

**Status Codes:**
- `403 Forbidden`: Privacy setting blocks the action
- `400 Bad Request`: Invalid parameters
- `404 Not Found`: Resource doesn't exist

---

## Frontend Integration

Update privacy settings:
```javascript
const response = await fetch(`/api/users/${userId}/privacy-settings`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    profile_visibility: 'private',
    allow_messages: false,
    allow_referrals: false,
    shield_mode: true,
    appointment_reminders: true
  })
});
```

---

## Future Enhancements

### Connections Only Profile Visibility
- Need to implement user connections/relationships table
- Check if viewer has an appointment relationship with user
- Check if viewer is in user's family connections

### Additional Shield Mode Protections
- Mask appointment details (location, time)
- Hide diagnosis information
- Anonymize health logs

### Granular Message Controls
- Block messages during specific hours
- Auto-delete messages after X days
- Require confirmation before sending

---

## Security Notes

⚠️ **Important:**
- Privacy checks happen server-side only
- Never trust client-side privacy controls
- Always verify user identity before privacy checks
- Log privacy violations for security monitoring

✅ **Best Practices:**
- Check privacy settings BEFORE performing action
- Return generic error messages (don't expose if user exists)
- Cache privacy settings per request (avoid multiple DB calls)
- Update `updated_at` timestamp on every privacy change
