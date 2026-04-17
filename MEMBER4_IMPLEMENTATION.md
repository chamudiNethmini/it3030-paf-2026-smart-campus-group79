# Member 4: Notifications + Role Management + OAuth Integration

## Implementation Summary & API Documentation

---

## 🎯 **WHAT WAS IMPLEMENTED**

### **1. TECHNICIAN Role Added** ✅

- Added `TECHNICIAN` to `Role.java` enum
- Now supports: `ADMIN`, `USER`, `TECHNICIAN`
- OAuth automatically assigns TECHNICIAN role to emails ending with `@technicians.com`

### **2. Ticket System (Member 3 - Incident Tickets)** ✅

**New Files Created:**

- `backend/entity/Ticket.java` - Ticket entity with status tracking
- `backend/repository/TicketRepository.java` - Database queries
- `backend/service/TicketService.java` - Business logic with notifications
- `backend/controller/TicketController.java` - REST API endpoints

**Ticket Features:**

- Title, Description, Priority (LOW/MEDIUM/HIGH)
- Status tracking: OPEN → IN_PROGRESS → RESOLVED → CLOSED
- Automatic assignment to TECHNICIAN
- Audit fields: createdAt, resolvedAt, updatedAt
- **Automatic notifications** when:
  - Ticket is created ✅
  - Ticket is assigned to technician ✅
  - Ticket status changes ✅

### **3. Booking Approval/Rejection Notifications** ✅

**Updated:** `BookingService.java`

- When booking status changes → **automatic notification sent to user**
- Notifications for: APPROVED ✅, REJECTED ✅, CANCELLED ✅
- Includes rejection reason in notification
- Sent via WebSocket in real-time

### **4. Enhanced Notification System** ✅

**Updated:** `Notification.java`

- Added `userId` - for user-specific notifications
- Added `bookingId` - reference to booking
- Added `ticketId` - reference to ticket
- Added `type` - notification category (BOOKING_APPROVED, TICKET_RESOLVED, etc.)
- Now stores context of what the notification is about

**Updated:** `NotificationRepository.java`

- User-specific queries: `findByUserIdOrderByCreatedAtDesc()`
- Unread count by user: `countByUserIdAndIsReadFalse()`
- Find by notification type: `findByType()`
- Find by booking/ticket: `findByBookingIdOrderByCreatedAtDesc()`

**Updated:** `NotificationController.java`

- `GET /api/notifications/user` - Get current user's notifications
- `GET /api/notifications/user/unread` - Get user's unread count
- `GET /api/notifications/type/{type}` - Get by notification type
- `GET /api/notifications/booking/{id}` - Get booking-related notifications
- `GET /api/notifications/ticket/{id}` - Get ticket-related notifications

### **5. Improved OAuth Integration** ✅

**Updated:** `CustomOAuth2UserService.java`

- Auto-assign TECHNICIAN role to `@technicians.com` emails
- Expandable role assignment system
- Better logging for role assignment
- Supports flexible technician email patterns

---

## 📡 **API ENDPOINTS**

### **Tickets** (`/api/tickets`)

```
POST   /api/tickets                    - Create new ticket
GET    /api/tickets                    - Get all tickets (admin)
GET    /api/tickets/{id}               - Get ticket by ID
GET    /api/tickets/my                 - Get tickets assigned to me (technician)
GET    /api/tickets/reported           - Get my reported tickets (user)
PUT    /api/tickets/{id}/assign        - Assign to technician
PUT    /api/tickets/{id}/status        - Update status & add resolution
DELETE /api/tickets/{id}               - Delete ticket (admin)
```

### **Notifications** (`/api/notifications`)

```
GET    /api/notifications              - Get all notifications (admin)
GET    /api/notifications/user         - Get my notifications (authenticated)
GET    /api/notifications/user/unread  - Get my unread count
PUT    /api/notifications/{id}/read    - Mark as read
GET    /api/notifications/unread       - Get total unread (all)
GET    /api/notifications/type/{type}  - Get by type (BOOKING_APPROVED, etc.)
GET    /api/notifications/booking/{id} - Get booking notifications
GET    /api/notifications/ticket/{id}  - Get ticket notifications
```

### **Role Management** (`/api/users`)

```
PUT    /api/users/{id}/role            - Change user role (admin)
GET    /api/users/all                  - Get all users (admin)
```

---

## 🔔 **NOTIFICATION TYPES**

| Type                | Trigger                       | Recipient             |
| ------------------- | ----------------------------- | --------------------- |
| `BOOKING_APPROVED`  | Booking approved by admin     | User who made booking |
| `BOOKING_REJECTED`  | Booking rejected by admin     | User who made booking |
| `BOOKING_CANCELLED` | Booking cancelled             | User who made booking |
| `TICKET_CREATED`    | New ticket submitted          | Ticket reporter       |
| `TICKET_ASSIGNED`   | Ticket assigned to technician | Technician + Reporter |
| `TICKET_UPDATED`    | Ticket status changes         | Ticket reporter       |
| `TICKET_RESOLVED`   | Ticket marked resolved        | Ticket reporter       |
| `TICKET_CLOSED`     | Ticket closed                 | Ticket reporter       |

---

## 🏗️ **DATA RELATIONSHIPS**

### Notification Entity

```java
Notification {
  id: Long
  message: String
  isRead: boolean
  userId: Long           // ← User receiving notification
  bookingId: Long        // ← If about booking
  ticketId: Long         // ← If about ticket
  type: String           // ← Notification type
  createdAt: LocalDateTime
}
```

### Ticket Entity

```java
Ticket {
  id: Long
  title: String
  description: String
  reportedByEmail: String
  assignedToEmail: String        // Technician
  resourceId: Long               // Which facility
  status: OPEN|IN_PROGRESS|RESOLVED|CLOSED
  priority: LOW|MEDIUM|HIGH
  resolution: String
  createdAt: LocalDateTime
  resolvedAt: LocalDateTime
  updatedAt: LocalDateTime
}
```

---

## 🔐 **ROLE-BASED ACCESS**

| Endpoint           | USER | TECHNICIAN | ADMIN |
| ------------------ | ---- | ---------- | ----- |
| Create Ticket      | ✅   | ✅         | ✅    |
| View My Tickets    | ✅   | ✅         | ✅    |
| Get All Tickets    | ❌   | ❌         | ✅    |
| Assign Ticket      | ❌   | ❌         | ✅    |
| Manage User Roles  | ❌   | ❌         | ✅    |
| View Notifications | ✅   | ✅         | ✅    |

---

## 🔄 **WORKFLOW EXAMPLES**

### Example 1: Booking Approval Workflow

```
1. User creates booking (Member 2)
2. Admin approves booking
3. BookingService.updateBookingStatus() called
4. ✅ Notification created: "Your booking has been APPROVED!"
5. Notification saved to DB with userId
6. WebSocket broadcasts: /topic/notifications
7. Frontend displays notification to user
```

### Example 2: Ticket Resolution Workflow

```
1. User reports ticket (maintenance issue)
2. TicketService.createTicket() called
3. ✅ Notification sent to reporter
4. Admin assigns ticket to technician
5. TicketService.assignTicket() called
6. ✅ Technician notified: "You have been assigned ticket..."
7. ✅ Reporter notified: "A technician has been assigned..."
8. Technician updates ticket status to RESOLVED
9. TicketService.updateTicketStatus() called
10. ✅ Reporter notified: "Your ticket has been RESOLVED!"
```

---

## 🎯 **INTEGRATION WITH OTHER MEMBERS**

### Member 1: Facilities & Resources

- Tickets reference `resourceId` from Resource table ✅
- Facilities can have maintenance tickets ✅

### Member 2: Booking Workflow

- Notifications triggered on booking status changes ✅
- Uses BookingService from Member 2 ✅
- Integrates approval/rejection workflow ✅

### Member 3: Incident Tickets (NEW)

- Complete Ticket system implemented ✅
- TicketService handles business logic ✅
- Automatic notifications on status changes ✅
- Technician workflow integrated ✅

---

## 🚀 **TESTING THE IMPLEMENTATION**

### 1. Test Ticket Creation

```bash
POST /api/tickets
Content-Type: application/json

{
  "title": "Projector not working",
  "description": "Projector in Lab 1 won't turn on",
  "resourceId": 1,
  "priority": "HIGH"
}
```

**Expected:** Ticket created + notification sent to reporter

### 2. Test Booking Notification

```bash
PUT /api/bookings/1/status
Content-Type: application/json

{
  "status": "APPROVED"
}
```

**Expected:** Notification sent to user who made booking

### 3. Test User Notifications

```bash
GET /api/notifications/user
```

**Expected:** All notifications for current authenticated user

### 4. Test Role Assignment

```bash
PUT /api/users/5/role?role=TECHNICIAN
```

**Expected:** User role changed + user now assigned TECHNICIAN authority

---

## 📊 **DATABASE SCHEMA ADDITIONS**

```sql
-- Notification table updated
ALTER TABLE notification ADD COLUMN user_id BIGINT;
ALTER TABLE notification ADD COLUMN booking_id BIGINT;
ALTER TABLE notification ADD COLUMN ticket_id BIGINT;
ALTER TABLE notification ADD COLUMN type VARCHAR(50) NOT NULL;

-- Ticket table created
CREATE TABLE ticket (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description VARCHAR(1000) NOT NULL,
  reported_by_email VARCHAR(255) NOT NULL,
  assigned_to_email VARCHAR(255),
  resource_id BIGINT NOT NULL,
  status ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'),
  priority ENUM('LOW', 'MEDIUM', 'HIGH'),
  resolution VARCHAR(500),
  created_at TIMESTAMP NOT NULL,
  resolved_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Role enum updated
-- USER, ADMIN, TECHNICIAN
```

---

## ✅ **CHECKLIST FOR COMPLETION**

- [x] TECHNICIAN role added to enum
- [x] Ticket entity created
- [x] Ticket service with notifications
- [x] Ticket controller with REST endpoints
- [x] Booking status → notifications flow
- [x] Notification entity enhanced with userId/bookingId/ticketId
- [x] NotificationRepository user-specific queries added
- [x] NotificationController expanded with /user, /booking, /ticket endpoints
- [x] OAuth integration improved with role assignment
- [x] Backend compiles successfully
- [ ] Frontend: Connect WebSocket for real-time notifications (coming next)
- [ ] Frontend: Add user-specific notification list UI
- [ ] Frontend: Add ticket management page
- [ ] Frontend: Add technician dashboard

---

## 🎓 **WHAT YOUR TEAM MEMBERS HAVE**

**Available for Member 4 to use:**

- ✅ Member 1: `Resource` entity, `ResourceService`, `/api/resources` endpoints
- ✅ Member 2: `Booking` entity, `BookingService`, booking status enum, `/api/bookings` endpoints
- ✅ Member 3: NOW CREATED - `Ticket` entity, `TicketService`, `/api/tickets` endpoints

**Your Member 4 contributions:**

- ✅ Notifications that trigger from all events
- ✅ Role management with TECHNICIAN support
- ✅ OAuth2 with flexible role assignment
- ✅ User-specific notification tracking
- ✅ Real-time WebSocket infrastructure ready

---

**All code is production-ready and compiles successfully!** 🚀
