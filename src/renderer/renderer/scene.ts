//import { RenderObject } from './objects';
//import UUID from './base/objid';
import BaseShape from './base/baseshape';

export class Scene {

    private objects: BaseShape[] = [];

    public add (object: BaseShape) {
        this.objects.push(object);
    }

    public getObjects () : BaseShape[] {
        return this.objects;
    }
}