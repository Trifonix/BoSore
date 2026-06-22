## Что есть в системе (сущности):

Note - заметки
User — владелец источников, автор, голосующий
Source — сам источник (может быть приватным или публичным)
Tag — метки (многие-ко-многим с Source)
Vote — голос пользователя за публичный источник (уникально: один пользователь → один голос на источник)
(опционально) Collection / Folder — папки/коллекции для организации
(опционально) SourceVersion — версии источника (история изменений)

## Ключевые правила:

- Публичность — это свойство Source (visibility)
- Голосовать можно только по публичным (проверяется на уровне приложения; можно усилить триггером/констрейнтом позже)
- Голос уникален: (userId, sourceId) — уникальный индекс

## Схема базы данных
- Note: id, ownerId -> User, title, createdAt
- User: id (cuid), email unique, name optional, createdAt
- Source: id, ownerId -> User, title (краткая метка записи), content (описание книги/статьи),
  description (оформление источника по ГОСТ, название уже внутри), categoryId -> Category,
  visibility (PRIVATE|PUBLIC, default PRIVATE), createdAt, updatedAt, publishedAt nullable
- Vote: id, userId -> User, sourceId -> Source, value int default 1, createdAt
- Category: id, category
- Ограничение: один пользователь может проголосовать за источник только один раз:
  UNIQUE(userId, sourceId)
- Индексы:
  Source(ownerId, updatedAt)
  Source(visibility, createdAt)
  Vote(sourceId)
  Vote(userId)
- onDelete: Cascade для связей
