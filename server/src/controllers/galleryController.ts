import { FastifyRequest, FastifyReply } from 'fastify';
import { Gallery, IGallery } from '../models/Gallery.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js';

export async function getGalleryItems(
  request: FastifyRequest<{ Querystring: { season?: string; type?: string } }>,
  reply: FastifyReply
) {
  try {
    const { season, type } = request.query;
    const filter: Record<string, any> = {};

    if (season) {
      const seasonNum = parseInt(season, 10);
      if (!isNaN(seasonNum)) {
        filter.seasonNumber = seasonNum;
      }
    }

    if (type && (type === 'Photo' || type === 'Video')) {
      filter.type = type;
    }

    const items = await Gallery.find(filter).sort({ seasonNumber: 1, createdAt: -1 });

    // Group items by season for easy frontend consumption
    const grouped: Record<number, IGallery[]> = {
      1: [],
      2: [],
      3: [],
      4: [],
    };

    items.forEach((item) => {
      const s = item.seasonNumber;
      if (!grouped[s]) {
        grouped[s] = [];
      }
      grouped[s].push(item);
    });

    return reply.status(200).send({
      success: true,
      count: items.length,
      items,
      grouped,
    });
  } catch (error: any) {
    request.log.error(error);
    return reply.status(500).send({
      error: 'Internal Server Error',
      message: 'Failed to fetch gallery items',
    });
  }
}

export async function createGalleryItem(request: FastifyRequest, reply: FastifyReply) {
  try {
    let title: string = '';
    let url: string = '';
    let type: 'Photo' | 'Video' = 'Photo';
    let seasonNumber: number = 4;
    let description: string = '';
    let publicId: string | undefined = undefined;

    // Check if request is multipart/form-data (file upload)
    if (request.isMultipart()) {
      const parts = request.parts();
      let fileBuffer: Buffer | null = null;
      let fileName: string = 'media';

      for await (const part of parts) {
        if (part.type === 'file') {
          fileBuffer = await part.toBuffer();
          fileName = part.filename || 'media';
        } else {
          // Regular fields
          const fieldName = part.fieldname;
          const val = String(part.value);
          if (fieldName === 'title') title = val;
          if (fieldName === 'type' && (val === 'Photo' || val === 'Video')) type = val;
          if (fieldName === 'seasonNumber') seasonNumber = parseInt(val, 10) || 4;
          if (fieldName === 'description') description = val;
          if (fieldName === 'url') url = val;
        }
      }

      if (fileBuffer) {
        // Folder tag depending on season
        const folder = `cwc-season-${seasonNumber}`;
        const uploadResult = await uploadToCloudinary(fileBuffer, fileName, folder);
        url = uploadResult.url;
        publicId = uploadResult.public_id;
      }
    } else {
      // JSON payload
      const body = request.body as any;
      if (body) {
        title = body.title;
        url = body.url;
        type = body.type;
        seasonNumber = Number(body.seasonNumber) || 4;
        description = body.description || '';
        publicId = body.publicId;
      }
    }

    if (!title || !title.trim()) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: 'Media title is required',
      });
    }

    if (!url || !url.trim()) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: 'Media URL or file is required',
      });
    }

    if (!['Photo', 'Video'].includes(type)) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: 'Type must be either "Photo" or "Video"',
      });
    }

    const newItem = await Gallery.create({
      title: title.trim(),
      url: url.trim(),
      type,
      seasonNumber,
      description: description.trim(),
      publicId,
    });

    return reply.status(201).send({
      success: true,
      message: 'Gallery item uploaded successfully',
      item: newItem,
    });
  } catch (error: any) {
    request.log.error(error);
    return reply.status(500).send({
      error: 'Internal Server Error',
      message: error.message || 'Failed to upload media item',
    });
  }
}

export async function deleteGalleryItem(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  try {
    const { id } = request.params;
    const item = await Gallery.findById(id);

    if (!item) {
      return reply.status(404).send({
        error: 'Not Found',
        message: 'Gallery item not found',
      });
    }

    if (item.publicId) {
      await deleteFromCloudinary(item.publicId);
    }

    await Gallery.findByIdAndDelete(id);

    return reply.status(200).send({
      success: true,
      message: 'Media item deleted successfully',
      deletedId: id,
    });
  } catch (error: any) {
    request.log.error(error);
    return reply.status(500).send({
      error: 'Internal Server Error',
      message: 'Failed to delete gallery item',
    });
  }
}
