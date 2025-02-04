import {BaseEvents} from "../../modules/uv-shared-module/BaseEvents";
import {BaseExtension} from "../../modules/uv-shared-module/BaseExtension";
import {Bookmark} from "../../modules/uv-shared-module/Bookmark";
import {DownloadDialogue} from "./DownloadDialogue";
import {Events} from "./Events";
import {FooterPanel} from "../../modules/uv-shared-module/FooterPanel";
import {HeaderPanel} from "../../modules/uv-shared-module/HeaderPanel";
import {HelpDialogue} from "../../modules/uv-dialogues-module/HelpDialogue";
import {IMediaElementExtension} from "./IMediaElementExtension";
import {MediaElementCenterPanel} from "../../modules/uv-mediaelementcenterpanel-module/MediaElementCenterPanel";
import {MoreInfoRightPanel} from "../../modules/uv-moreinforightpanel-module/MoreInfoRightPanel";
import {ResourcesLeftPanel} from "../../modules/uv-resourcesleftpanel-module/ResourcesLeftPanel";
import {SettingsDialogue} from "./SettingsDialogue";
import {ShareDialogue} from "./ShareDialogue";
import IThumb = Manifold.IThumb;

export class Extension extends BaseExtension implements IMediaElementExtension {

    $downloadDialogue: JQuery;
    $shareDialogue: JQuery;
    $helpDialogue: JQuery;
    $settingsDialogue: JQuery;
    centerPanel: MediaElementCenterPanel;
    downloadDialogue: DownloadDialogue;
    shareDialogue: ShareDialogue;
    footerPanel: FooterPanel;
    headerPanel: HeaderPanel;
    helpDialogue: HelpDialogue;
    leftPanel: ResourcesLeftPanel;
    rightPanel: MoreInfoRightPanel;
    settingsDialogue: SettingsDialogue;

    create(): void {
        super.create();

        // listen for mediaelement enter/exit fullscreen events.
        $(window).bind('enterfullscreen', () => {
            this.component.publish(BaseEvents.TOGGLE_FULLSCREEN);
        });

        $(window).bind('exitfullscreen', () => {
            this.component.publish(BaseEvents.TOGGLE_FULLSCREEN);
        });

        this.component.subscribe(BaseEvents.CANVAS_INDEX_CHANGED, (canvasIndex: number) => {
            this.viewCanvas(canvasIndex);
        });

        this.component.subscribe(BaseEvents.THUMB_SELECTED, (thumb: IThumb) => {
            this.component.publish(BaseEvents.CANVAS_INDEX_CHANGED, thumb.index);
        });

        this.component.subscribe(BaseEvents.LEFTPANEL_EXPAND_FULL_START, () => {
            this.shell.$centerPanel.hide();
            this.shell.$rightPanel.hide();
        });

        this.component.subscribe(BaseEvents.LEFTPANEL_COLLAPSE_FULL_FINISH, () => {
            this.shell.$centerPanel.show();
            this.shell.$rightPanel.show();
            this.resize();
        });

        this.component.subscribe(Events.MEDIA_ENDED, () => {
            this.fire(Events.MEDIA_ENDED);
        });

        this.component.subscribe(Events.MEDIA_PAUSED, () => {
            this.fire(Events.MEDIA_PAUSED);
        });

        this.component.subscribe(Events.MEDIA_PLAYED, () => {
            this.fire(Events.MEDIA_PLAYED);
        });
    }

    createModules(): void{
        super.createModules();

        if (this.isHeaderPanelEnabled()) {
            this.headerPanel = new HeaderPanel(this.shell.$headerPanel);
        } else {
            this.shell.$headerPanel.hide();
        }

        if (this.isLeftPanelEnabled()) {
            this.leftPanel = new ResourcesLeftPanel(this.shell.$leftPanel);
        }

        this.centerPanel = new MediaElementCenterPanel(this.shell.$centerPanel);

        if (this.isRightPanelEnabled()){
            this.rightPanel = new MoreInfoRightPanel(this.shell.$rightPanel);
        }

        if (this.isFooterPanelEnabled()){
            this.footerPanel = new FooterPanel(this.shell.$footerPanel);
        } else {
            this.shell.$footerPanel.hide();
        }

        this.$helpDialogue = $('<div class="overlay help" aria-hidden="true"></div>');
        this.shell.$overlays.append(this.$helpDialogue);
        this.helpDialogue = new HelpDialogue(this.$helpDialogue);

        this.$downloadDialogue = $('<div class="overlay download" aria-hidden="true"></div>');
        this.shell.$overlays.append(this.$downloadDialogue);
        this.downloadDialogue = new DownloadDialogue(this.$downloadDialogue);

        this.$shareDialogue = $('<div class="overlay share" aria-hidden="true"></div>');
        this.shell.$overlays.append(this.$shareDialogue);
        this.shareDialogue = new ShareDialogue(this.$shareDialogue);

        this.$settingsDialogue = $('<div class="overlay settings" aria-hidden="true"></div>');
        this.shell.$overlays.append(this.$settingsDialogue);
        this.settingsDialogue = new SettingsDialogue(this.$settingsDialogue);

        if (this.isLeftPanelEnabled()){
            this.leftPanel.init();
        }

        if (this.isRightPanelEnabled()){
            this.rightPanel.init();
        }
    }

    render(): void {
        super.render();
    }

    isLeftPanelEnabled(): boolean {
        return Utils.Bools.getBool(this.data.config.options.leftPanelEnabled, true)
                && ((this.helper.isMultiCanvas() || this.helper.isMultiSequence()) || this.helper.hasResources());
    }

    bookmark(): void {
        super.bookmark();

        const canvas: Manifesto.ICanvas = this.extensions.helper.getCurrentCanvas();
        const bookmark: Bookmark = new Bookmark();

        bookmark.index = this.helper.canvasIndex;
        bookmark.label = <string>Manifesto.LanguageMap.getValue(canvas.getLabel());
        bookmark.thumb = canvas.getProperty('thumbnail');
        bookmark.title = this.helper.getLabel();
        bookmark.trackingLabel = window.trackingLabel;

        if (this.isVideo()){
            bookmark.type = manifesto.ResourceType.movingimage().toString();
        } else {
            bookmark.type = manifesto.ResourceType.sound().toString();
        }

        this.fire(BaseEvents.BOOKMARK, bookmark);
    }

    getEmbedScript(template: string, width: number, height: number): string {
        //const configUri: string = this.data.config.uri || '';
        //const script: string = String.format(template, this.getSerializedLocales(), configUri, this.helper.iiifResourceUri, this.helper.collectionIndex, this.helper.manifestIndex, this.helper.sequenceIndex, this.helper.canvasIndex, width, height, this.data.embedScriptUri);
        const appUri: string = this.getAppUri();
        const iframeSrc: string = `${appUri}#?manifest=${this.helper.iiifResourceUri}&c=${this.helper.collectionIndex}&m=${this.helper.manifestIndex}&s=${this.helper.sequenceIndex}&cv=${this.helper.canvasIndex}`;
        const script: string = Utils.Strings.format(template, iframeSrc, width.toString(), height.toString());
        return script;
    }

    // todo: use canvas.getThumbnail()
    getPosterImageUri(): string {

        const canvas: Manifesto.ICanvas = this.helper.getCurrentCanvas();
        const annotations: Manifesto.IAnnotation[] = canvas.getContent();
        
        if (annotations && annotations.length) {
            return annotations[0].getProperty('thumbnail');
        } else {
            return canvas.getProperty('thumbnail');
        }
    }

    isVideoFormat(type: string): boolean {
        const videoFormats: string[] = [manifesto.MediaType.mp4().toString(), manifesto.MediaType.webm().toString()];
        return videoFormats.indexOf(type) != -1;
    }

    isVideo(): boolean {

        const canvas: Manifesto.ICanvas = this.helper.getCurrentCanvas();
        const annotations: Manifesto.IAnnotation[] = canvas.getContent();
        
        if (annotations && annotations.length) {

            const formats: Manifesto.IAnnotationBody[] | null = this.getMediaFormats(canvas);

            for (let i = 0; i < formats.length; i++) {

                const format: Manifesto.IAnnotationBody = formats[i];
                const type: Manifesto.MediaType | null = format.getFormat();

                if (type) {
                    if (this.isVideoFormat(type.toString())) {
                        return true;
                    }
                }
            }
            
            return false;

        } else {
            const type: Manifesto.ResourceType | null = canvas.getType();

            if (type) {
                return type.toString() === manifesto.ResourceType.movingimage().toString();
            }
            
        }

        throw(new Error("Unable to determine media type"));
    }
}
