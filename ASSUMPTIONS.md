# حاجات متخمّنة (راجعيها مع Swagger)
الـ API.md مش بيوصف شكل كل الردود. دي الحقول/الأسماء اللي اتخمّنت وتتصلّح في ملف واحد لو اختلفت:
- `GET /api/lookups/enums`: بنقبل `{Enum:[{name,value}]}` أو `{Enum:{Name:value}}`. أسماء الـ enums المتخمّنة: `DeliverySlot` (Day/Midnight)، `PaymentMethod`، `Occasion`، `CatalogSection`، `DesignType`، `TicketCategory`.
- كارت المنتج: `id,name,price,oldPrice,imageUrl,isFavorite,stockLeft`. تفاصيل المنتج: `images[]` (`url|imageUrl`)، `colors[{id,name,hexCode,isAvailable}]`, `allowsCustomText, customTextLabel, customTextMaxLength, description`.
- `site`: `deliveryZones[{id,name,fee,supportsMidnight}]`، `paymentAccounts[{method,accountName,accountIdentifier,instructions}]`، `designPackages[...]`، روابط التواصل بتتعرض لو اسم الحقل فيه whatsapp/instagram/facebook/tiktok/phone/email.
- الطلب: `id, code, status, history[{status,createdAt}], items[{productName,quantity,lineTotal}], totalAmount, paymentDueAt, reveal`.
- `POST /api/gifts/{token}/unlock`: بنفترض ان الرد فيه `unlockCode` (الدوك بيقول "{ unlockCode } for the lock" والـ Architecture بيقول بيرجّع الكود).
- `unread-count`: رقم أو `{count|unreadCount}`.
- تذاكر: `messages[{id,body,isFromAdmin,senderName,createdAt}]`. السجل: `createdAt,userName,entityName,entityId,action`.
- الأدمن "نظرة عامة" بتعرض أي أرقام راجعة + جداول `daily/topProducts/stores` بشكل عام.
لتوليد الأنواع الدقيقة: `npm run gen:api` وبعدها استبدلي `Rec` بالأنواع.
