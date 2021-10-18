//import { RenderObject } from './objects';
import UUID from './base/objid';
export class Scene {

    private objects: UUID[] = [];

    public add (object: UUID) {
        this.objects.push(object);
    }

    public getObjects () : UUID[] {
        return this.objects;
    }
}